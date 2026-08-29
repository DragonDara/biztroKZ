type CategoryLabelInput = {
  name: string
  menuSection?: { name: string } | null
}

export function getCategoryLabel(category: CategoryLabelInput) {
  return category.menuSection
    ? `${category.menuSection.name} / ${category.name}`
    : category.name
}
