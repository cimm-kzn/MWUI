
/**
   * @static
   * @param structureType
   * @param models
   * @param magic
   * @param taskType
   * @return {Array}
   */
const modelsOfTypes = (structureType, models, magic, taskType) => {
  if (taskType === magic.TaskType.SEARCHING) {
    if (structureType === magic.StructureType.MOLECULE) {
      return models.filter(o => o.type === magic.ModelType.MOLECULE_SEARCHING);
    } else if (structureType === magic.StructureType.REACTION) {
      return models.filter(o => o.type === magic.ModelType.REACTION_SEARCHING);
    }
  } else if (taskType === magic.TaskType.MODELING) {
    if (structureType === magic.StructureType.MOLECULE) {
      return models.filter(o => o.type === magic.ModelType.MOLECULE_MODELING);
    } else if (structureType === magic.StructureType.REACTION) {
      return models.filter(o => o.type === magic.ModelType.REACTION_MODELING);
    }
  }
  return [];
};

  /**
   * @static
   * @param task
   * @param models
   * @param magic
   */
export const models = (task, models, magic) => task.data.map((structure) => {
  const modelSorted = modelsOfTypes(structure.type, models, magic, task.type);
  return {
    ...structure,
    models: modelSorted,
  };
});

export const additives = (structures, additives, magic) => structures.map(structure => ({
  ...structure,
  solvents: additives.filter(additive => additive.type === magic.AdditiveType.SOLVENT),
  catalysts: additives.filter(additive => additive.type === magic.AdditiveType.CATALYST),
}));

export const additivesOfType = (additives, magic) => ({
  solvents: additives.filter(additive => additive.type === magic.AdditiveType.SOLVENT),
  catalysts: additives.filter(additive => additive.type === magic.AdditiveType.CATALYST),
});

