export const MENU_TRANSLATION_MODELS = {
    qwen3: "@cf/qwen/qwen3-30b-a3b-fp8",
    gemma4: "@cf/google/gemma-4-26b-a4b-it",
    glm53flash: "@cf/zai-org/glm-5.3-flash",
    mistralSmall31: "@cf/mistralai/mistral-small-3.1-24b-instruct",
    gptOss120b: "@cf/openai/gpt-oss-120b"
  } as const
  
  export type MenuTranslationModelKey = keyof typeof MENU_TRANSLATION_MODELS
  
  export type MenuTranslationModelId =
    (typeof MENU_TRANSLATION_MODELS)[MenuTranslationModelKey]
  
  export const DEFAULT_MENU_TRANSLATION_MODEL =
    MENU_TRANSLATION_MODELS.qwen3
  
  /**
   * Switch model by changing this line (or uncomment another).
   * No UI yet.
   */
  export const ACTIVE_MENU_TRANSLATION_MODEL: MenuTranslationModelId =
    DEFAULT_MENU_TRANSLATION_MODEL
  // export const ACTIVE_MENU_TRANSLATION_MODEL = MENU_TRANSLATION_MODELS.gemma4
  // export const ACTIVE_MENU_TRANSLATION_MODEL = MENU_TRANSLATION_MODELS.glm53flash
  // export const ACTIVE_MENU_TRANSLATION_MODEL = MENU_TRANSLATION_MODELS.mistralSmall31
  // export const ACTIVE_MENU_TRANSLATION_MODEL = MENU_TRANSLATION_MODELS.gptOss120b