import { Klass, Component, Entity } from './'


// TODO, add things like all_component_classes, changed_components, etc
export interface Query {
  entity_name?: string
  component_classes?: Klass<Component>[]
}
