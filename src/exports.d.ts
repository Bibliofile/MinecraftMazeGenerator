declare module 'generate-maze' {
  export interface Cell {
    x: number,
    y: number,
    top: boolean
    left: boolean
    bottom: boolean
    right: boolean
    set: number
  }

  export default function generate(width: number, height: number, includeEdges?: boolean): Cell[][]
}
