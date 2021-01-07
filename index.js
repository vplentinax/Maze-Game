const {
  Engine,
  Render,
  Runner,
  World,
  Bodies,
  Body,
  Events,
  Mouse,
  MouseConstraint
} = Matter;

const cellsH = 10;
const cellsV = 10;

const width = document.querySelector('.animation-wrapper').clientWidth;
const height = document.querySelector('.animation-wrapper').clientHeight;

const unitLenghtX = width / cellsH;
const unitLenghtY = width / cellsV;

const engine = Engine.create();
engine.world.gravity.y = 0;
const {world} = engine;

const render = Render.create({
  element: document.querySelector('.animation-wrapper'),
  engine: engine,
  options: {
    wireframes: false,
    width: width,
    height: height
  }
});

Render.run(render);
Runner.run(Runner.create(), engine);

const walls = [
  Bodies.rectangle(width / 2, 0, width, 2, {
    isStatic: true
  }),
  Bodies.rectangle(width / 2, height, width, 2, {
    isStatic: true
  }),
  Bodies.rectangle(0, height / 2, 2, height, {
    isStatic: true
  }),
  Bodies.rectangle(width, height / 2, 2, height, {
    isStatic: true
  })
];

World.add(world, walls);

const shuffle = arr => {
  let counter = arr.length;
  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);
    counter--;
    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }
  return arr;
};

const grid = Array(cellsV)
  .fill(null)
  .map(() => Array(cellsH)
  .fill(false));

const verticals = Array(cellsV)
  .fill(null)
  .map(() => Array(cellsH - 1)
  .fill(false));

const horizontals = Array(cellsV - 1)
  .fill(null)
  .map(() => Array(cellsH)
  .fill(false));

const startRow = Math.floor(Math.random() * cellsV);
const startColumn = Math.floor(Math.random() * cellsH);

const stepThroughCell = (row, column) => {
  if (grid[row][column] === true) {
    return;
  }

  grid[row][column] = true;
  const neighbors = shuffle([
    [row - 1, column, 'up'],
    [row, column + 1, 'right'],
    [row + 1, column, 'down'],
    [row, column - 1, 'left']
  ]);

  for (const neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;
    if (
      nextRow < 0 ||
      nextRow >= cellsV ||
      nextColumn < 0 ||
      nextColumn >= cellsH
    ) {
      continue;
    }
    if (grid[nextRow][nextColumn]) {
      continue;
    }
    if (direction === 'left') {
      verticals[row][column - 1] = true;
    } else if (direction === 'right') {
      verticals[row][column] = true;
    } else if (direction === 'up') {
      horizontals[row - 1][column] = true;
    } else if (direction === 'down') {
      horizontals[row][column] = true;
    }
    stepThroughCell(nextRow, nextColumn);
  }
};

stepThroughCell(startRow, startColumn);
horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitLenghtX + unitLenghtX / 2,
      rowIndex * unitLenghtY + unitLenghtY,
      unitLenghtX,
      3,
      {
        label: 'wall',
        isStatic: true,
        render: {
          fillStyle: '#cdd0cb'
        }
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitLenghtX + unitLenghtX,
      rowIndex * unitLenghtY + unitLenghtY / 2,
      3,
      unitLenghtY,
      {
        label: 'wall',
        isStatic: true,
        render: {
          fillStyle: '#cdd0cb'
        }
      }
    );
    World.add(world, wall);
  });
});

const goal = Bodies.rectangle(
  width - unitLenghtX / 2,
  height - unitLenghtY / 2,
  unitLenghtX * 0.7,
  unitLenghtY * 0.7,
  {
    isStatic: true,
    label: 'goal',
    render: {
      fillStyle: '#00917c'
    }
  }
);

World.add(world, goal);
const ballRadius = Math.min(unitLenghtX, unitLenghtY) / 4;
const ball = Bodies.circle(unitLenghtX / 2, unitLenghtY / 2, ballRadius, {
  label: 'ball',
  render: {
    fillStyle: '#ffb26b'
  }
});

World.add(world, ball);
document.addEventListener('keydown', event => {
  const {x, y} = ball.velocity;
  if (event.code === 'KeyW' || event.code === 'ArrowUp') {
    Body.setVelocity(ball, {
      x,
      y: y - 5
    });
  }
  if (event.code === 'KeyZ' || event.code === 'ArrowDown') {
    Body.setVelocity(ball, {
      x,
      y: y + 5
    });
  }
  if (event.code === 'KeyA' || event.code === 'ArrowLeft') {
    Body.setVelocity(ball, {
      x: x - 5,
      y
    });
  }
  if (event.code === 'KeyD' || event.code === 'ArrowRight') {
    Body.setVelocity(ball, {
      x: x + 5,
      y
    });
  }
});

const widthDevace = window.innerWidth;
if (widthDevace <= 950) {
  const mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false
        }
      }
    });
  World.add(world, mouseConstraint);
  render.mouse = mouse;
}

Events.on(engine, 'collisionStart', event => {
  event.pairs.forEach(collision => {
    const labels = ['ball', 'goal'];
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      world.gravity.y = 1;
      world.bodies.forEach(body => {
        if (body.label === 'wall') {
          Body.setStatic(body, false);
        }
      });
      setTimeout(() => {
        document.querySelector('.message-two').classList.remove('hidden');
        document.querySelector('.message-two').classList.add('show');
      }, 800);
    }
  });
});

function start() {
  setTimeout(() => {
    document.querySelector('.message-one').classList.remove('show');
    document.querySelector('.message-one').classList.add('hidden');
  }, 500);
}

function restart() {
  setTimeout(() => {
    document.querySelector('.message-two').classList.remove('show');
    document.querySelector('.message-two').classList.add('hidden');
    location.reload();
  }, 500);
}
