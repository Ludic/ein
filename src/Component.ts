/**
 * Interface for all Components. A Component is intended as a data holder and provides data to be processed in an
 * [[System]]. But do as you wish.
 * [[System]]s have no state and [[Component]]s have no behavior!!!!!
 */
export const ComponentSymbol = Symbol.for('Component')
export default abstract class Component {
  protected [ComponentSymbol] = true
}
