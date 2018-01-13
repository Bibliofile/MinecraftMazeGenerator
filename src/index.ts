import generate from 'generate-maze'

import { config } from './config'

const canvas = document.querySelector('canvas')!
const context = canvas.getContext('2d')!

function debounce (func: () => void, wait: number) {
  let timeout: number
  const later = function () {
    timeout = 0
    func()
  }

  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

function draw () {
  let { width, height, wallSize, walkSize, includeSides } = config

  const cellSize = wallSize * 2 + walkSize
  const cellOffset = wallSize + walkSize

  const maze = generate(width, height, includeSides)

  canvas.width = (width * wallSize) + (width * walkSize) + wallSize
  canvas.height = (height * wallSize) + (height * walkSize) + wallSize
  document.querySelector('[data-show=dimensions]')!.innerHTML = `${canvas.width} &times; ${canvas.height}`

  context.fillStyle = 'white'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = 'black'

  maze.forEach(row => {
    row.forEach(cell => {
      // Top left
      const x = cell.x * cellOffset
      const y = cell.y * cellOffset
      if (cell.top) {
        context.fillRect(x, y, cellSize, wallSize)
      }
      if (cell.left) {
        context.fillRect(x, y, wallSize, cellSize)
      }
      if (cell.right) {
        context.fillRect(x + wallSize + walkSize, y, wallSize, cellSize)
      }
      if (cell.bottom) {
        context.fillRect(x, y + wallSize + walkSize, cellSize, wallSize)
      }
    })
  })
}

function generateCommand () {
  if (canvas.width * canvas.height > 2 ** 16 && confirm('Maze is probably too large, this may crash your browser. Continue?')) {
    return
  }

  let { wallSize, wallHeight, walkSize, block } = config
  // MineCraft... 0 wallSize = 1 block
  wallSize--
  walkSize--
  wallHeight--

  let size = wallSize + walkSize
  if (!size) size = 1

  const commands: string[] = [
    `# Clear maze blocks\n`
  ]

  const clearSize = Math.floor(Math.sqrt(32768 / (wallHeight + 1)))
  for (let y = 0; y < canvas.height; y += clearSize) {
    for (let x = 0; x < canvas.width; x += clearSize) {
      const xMax = Math.min(x + clearSize, canvas.width)
      const yMax = Math.min(y + clearSize, canvas.height)
      commands.push(`fill ~${x} ~ ~${y} ~${xMax - 1} ~${wallHeight} ~${yMax - 1} air\n`)
    }
  }

  commands.push(`# Fill maze blocks\n`)

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const { data } = context.getImageData(x, y, 1, 1)
      if (data[0]) continue
      commands.push(`fill ~${x} ~ ~${y} ~${x} ~${wallHeight} ~${y} ${block}\n`)
    }
  }

  const element = document.body.appendChild(document.createElement('a'))

  const commandData = new Blob(commands, { type: 'text/plain' })
  element.href = URL.createObjectURL(commandData)
  element.setAttribute('download', 'maze.mcfunction')
  element.style.display = 'none'
  element.click()
  document.body.removeChild(element)
}

const drawDelay = debounce(draw, 500)

function validate () {
  Array.from(document.querySelectorAll('input')).forEach(element => {
    if (element.type === 'number') {
      if (+element.value > +element.max) {
        element.value = element.max
      } else if (+element.value < +element.min) {
        element.value = element.min
      }
    }
  })

  drawDelay()
}

document.addEventListener('change', validate)
document.querySelector('button')!.addEventListener('click', generateCommand)

draw()
