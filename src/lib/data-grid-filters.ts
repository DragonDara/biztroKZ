import type {
  BooleanFilterOperator,
  DateFilterOperator,
  FilterOperator,
  FilterValue,
  NumberFilterOperator,
  SelectFilterOperator,
  TextFilterOperator
} from "@/types/data-grid"
import type { FilterFn, Row } from "@tanstack/react-table"

export const TEXT_FILTER_OPERATORS: ReadonlyArray<{
  label: string
  value: TextFilterOperator
}> = [
  { label: "contains", value: "contains" },
  { label: "notContains", value: "notContains" },
  { label: "equals", value: "equals" },
  { label: "notEquals", value: "notEquals" },
  { label: "startsWith", value: "startsWith" },
  { label: "endsWith", value: "endsWith" },
  { label: "isEmpty", value: "isEmpty" },
  { label: "isNotEmpty", value: "isNotEmpty" }
]

export const NUMBER_FILTER_OPERATORS: ReadonlyArray<{
  label: string
  value: NumberFilterOperator
}> = [
  { label: "equals", value: "equals" },
  { label: "notEquals", value: "notEquals" },
  { label: "lessThan", value: "lessThan" },
  { label: "lessThanOrEqual", value: "lessThanOrEqual" },
  { label: "greaterThan", value: "greaterThan" },
  { label: "greaterThanOrEqual", value: "greaterThanOrEqual" },
  { label: "isBetween", value: "isBetween" },
  { label: "isEmpty", value: "isEmpty" },
  { label: "isNotEmpty", value: "isNotEmpty" }
]

export const DATE_FILTER_OPERATORS: ReadonlyArray<{
  label: string
  value: DateFilterOperator
}> = [
  { label: "equals", value: "equals" },
  { label: "notEquals", value: "notEquals" },
  { label: "before", value: "before" },
  { label: "after", value: "after" },
  { label: "onOrBefore", value: "onOrBefore" },
  { label: "onOrAfter", value: "onOrAfter" },
  { label: "isBetween", value: "isBetween" },
  { label: "isEmpty", value: "isEmpty" },
  { label: "isNotEmpty", value: "isNotEmpty" }
]

export const SELECT_FILTER_OPERATORS: ReadonlyArray<{
  label: string
  value: SelectFilterOperator
}> = [
  { label: "is", value: "is" },
  { label: "isNot", value: "isNot" },
  { label: "isAnyOf", value: "isAnyOf" },
  { label: "isNoneOf", value: "isNoneOf" },
  { label: "isEmpty", value: "isEmpty" },
  { label: "isNotEmpty", value: "isNotEmpty" }
]

export const BOOLEAN_FILTER_OPERATORS: ReadonlyArray<{
  label: string
  value: BooleanFilterOperator
}> = [
  { label: "isTrue", value: "isTrue" },
  { label: "isFalse", value: "isFalse" }
]

export function getDefaultOperator(variant: string): FilterOperator {
  switch (variant) {
    case "number":
      return "equals"
    case "date":
      return "equals"
    case "select":
    case "multi-select":
      return "is"
    case "checkbox":
      return "isTrue"
    default:
      return "contains"
  }
}

export function getOperatorsForVariant(variant: string): ReadonlyArray<{
  label: string
  value: FilterOperator
}> {
  switch (variant) {
    case "number":
      return NUMBER_FILTER_OPERATORS
    case "date":
      return DATE_FILTER_OPERATORS
    case "select":
    case "multi-select":
      return SELECT_FILTER_OPERATORS
    case "checkbox":
      return BOOLEAN_FILTER_OPERATORS
    default:
      return TEXT_FILTER_OPERATORS
  }
}

export function getFilterFn<TData>(): FilterFn<TData> {
  return (row: Row<TData>, columnId: string, filterValue: unknown): boolean => {
    if (!filterValue || typeof filterValue !== "object") {
      return true
    }

    const filter = filterValue as FilterValue
    const { operator, value, endValue } = filter

    const cellValue = row.getValue(columnId)

    if (operator === "isEmpty") {
      return (
        cellValue === null ||
        cellValue === undefined ||
        cellValue === "" ||
        (Array.isArray(cellValue) && cellValue.length === 0)
      )
    }

    if (operator === "isNotEmpty") {
      return !(
        cellValue === null ||
        cellValue === undefined ||
        cellValue === "" ||
        (Array.isArray(cellValue) && cellValue.length === 0)
      )
    }

    if (operator === "isTrue") {
      return cellValue === true
    }

    if (operator === "isFalse") {
      return cellValue === false || !cellValue
    }

    if (value === undefined || value === null || value === "") {
      return true
    }

    const cellValueStr = String(cellValue ?? "").toLowerCase()
    const filterValueStr =
      typeof value === "string" ? value.toLowerCase() : String(value)

    if (operator === "contains") {
      return cellValueStr.includes(filterValueStr)
    }

    if (operator === "notContains") {
      return !cellValueStr.includes(filterValueStr)
    }

    if (operator === "equals") {
      if (typeof cellValue === "number" && typeof value === "number") {
        return cellValue === value
      }
      if (cellValue instanceof Date && typeof value === "string") {
        const cellDate = new Date(cellValue)
        const filterDate = new Date(value)
        return cellDate.toDateString() === filterDate.toDateString()
      }
      return cellValueStr === filterValueStr
    }

    if (operator === "notEquals") {
      if (typeof cellValue === "number" && typeof value === "number") {
        return cellValue !== value
      }
      if (cellValue instanceof Date && typeof value === "string") {
        const cellDate = new Date(cellValue)
        const filterDate = new Date(value)
        return cellDate.toDateString() !== filterDate.toDateString()
      }
      return cellValueStr !== filterValueStr
    }

    if (operator === "startsWith") {
      return cellValueStr.startsWith(filterValueStr)
    }

    if (operator === "endsWith") {
      return cellValueStr.endsWith(filterValueStr)
    }

    if (typeof cellValue === "number" && typeof value === "number") {
      if (operator === "greaterThan") {
        return cellValue > value
      }

      if (operator === "greaterThanOrEqual") {
        return cellValue >= value
      }

      if (operator === "lessThan") {
        return cellValue < value
      }

      if (operator === "lessThanOrEqual") {
        return cellValue <= value
      }

      if (operator === "isBetween" && typeof endValue === "number") {
        return cellValue >= value && cellValue <= endValue
      }
    }

    if (cellValue instanceof Date || typeof cellValue === "string") {
      const cellDate = new Date(cellValue)
      if (!Number.isNaN(cellDate.getTime()) && typeof value === "string") {
        const filterDate = new Date(value)

        if (operator === "before") {
          return cellDate < filterDate
        }

        if (operator === "after") {
          return cellDate > filterDate
        }

        if (operator === "onOrBefore") {
          return cellDate <= filterDate
        }

        if (operator === "onOrAfter") {
          return cellDate >= filterDate
        }

        if (operator === "isBetween" && typeof endValue === "string") {
          const filterDate2 = new Date(endValue)
          return cellDate >= filterDate && cellDate <= filterDate2
        }
      }
    }

    if (operator === "is") {
      if (Array.isArray(cellValue)) {
        return cellValue.some(v => String(v) === String(value))
      }
      return String(cellValue) === String(value)
    }

    if (operator === "isNot") {
      if (Array.isArray(cellValue)) {
        return !cellValue.some(v => String(v) === String(value))
      }
      return String(cellValue) !== String(value)
    }

    if (operator === "isAnyOf" && Array.isArray(value)) {
      if (Array.isArray(cellValue)) {
        return cellValue.some(v => value.some(fv => String(v) === String(fv)))
      }
      return value.some(fv => String(cellValue) === String(fv))
    }

    if (operator === "isNoneOf" && Array.isArray(value)) {
      if (Array.isArray(cellValue)) {
        return !cellValue.some(v => value.some(fv => String(v) === String(fv)))
      }
      return !value.some(fv => String(cellValue) === String(fv))
    }

    return true
  }
}
