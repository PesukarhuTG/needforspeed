const MAX_ENEMY = 7;

const score = document.querySelector('.score'),
      start = document.querySelector('.start'),
      gameArea = document.querySelector('.gameArea'),
      car = document.createElement('div');

car.classList.add('car');

start.addEventListener('click', startGame);
document.addEventListener('keydown', startRun);
document.addEventListener('keyup', stopRun);

const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowRight: false,
    ArrowLeft: false
};

const setting = {
    start: false,
    score: 0,
    speed: 3,
    traffic: 3 //плотность траффика (сложность игры)
};

//ф-ция определяет, сколько нужно линий в зависимости от размера экрана
//получает высоту элемента и возвращает значение (кол-во эл-тов помещается)
function getQuantityElemenets(heightElement) {
   return document.documentElement.clientHeight / heightElement + 1;
}

function startGame() {
    start.classList.add('hide');

    //для линий разделения
    for (let i = 0; i < getQuantityElemenets(100); i++) {
        const line = document.createElement('div');
        line.classList.add('line');
        line.style.top = `${i * 100}px`; //расстояние от верха игорового пространства
        line.y = i * 100; // для движения линий
        gameArea.appendChild(line);
    }

    //для создания автомобилей
    for (let i = 0; i < getQuantityElemenets(100 * setting.traffic); i++) {
        const enemy = document.createElement('div');
        const randomEnemy = Math.floor(Math.random() * MAX_ENEMY) + 1;
        enemy.classList.add('enemy');
        enemy.y = -100 * setting.traffic * (i + 1); //-100 т.е. другие авто выше поля игры
        enemy.style.left = Math.floor(Math.random() * (gameArea.offsetWidth - 50)) + 'px'; //расположение соперников
        enemy.style.top = enemy.y +'px'; //расстояние от верха игорового пространства
        enemy.style.background = `transparent url(./image/enemy${randomEnemy}.png) center / cover no-repeat`;
        gameArea.appendChild(enemy);
    }

    setting.start = true;
    
    gameArea.appendChild(car);
    setting.x = car.offsetLeft; //от левого края блока родителя до элемента
    setting.y = car.offsetTop; //от края верха родителя до бампера авто
    requestAnimationFrame(playGame);
}

function playGame() {
    
    if (setting.start) {
        moveRoad();//после запуска игры двигаются линии разметки
        moveEnemy();//после запуска игры двигаются авто соперников

        if (keys.ArrowLeft && setting.x >0) {
            setting.x -= setting.speed;
        }

        if (keys.ArrowRight && setting.x < (gameArea.offsetWidth - car.offsetWidth)) {
            setting.x += setting.speed;
        }

        if (keys.ArrowUp && setting.y > 0) {
            setting.y -= setting.speed;
        }

        if (keys.ArrowDown && setting.y < (gameArea.offsetHeight - car.offsetHeight)) {
            setting.y += setting.speed;
        }
 
        car.style.left = setting.x + 'px'; //расстояние от левого края игорового пространства
        car.style.top = setting.y + 'px'; //расстояние от верха игорового пространства
        
        requestAnimationFrame(playGame); //рекурсия для плавности
    }
}

function startRun(event) {
    if (keys.hasOwnProperty(event.key)) {
        event.preventDefault();
        keys[event.key] = true;
    }
}

function stopRun(event) { 
    if (keys.hasOwnProperty(event.key)) {
        event.preventDefault();
        keys[event.key] = false;
    }
}

//ф-ция движения дороги
function moveRoad() {
    let lines = document.querySelectorAll('.line');

    lines.forEach(function(element) {
        element.y += setting.speed;
        element.style.top = element.y + 'px';

        if (element.y >= document.documentElement.clientHeight) {
            element.y = -100;
        }
    });
}

//ф-ция движения авто соперников
function moveEnemy() {
    let enemies = document.querySelectorAll('.enemy');

    enemies.forEach(function(element) {
        element.y += setting.speed / 2; //если не разделим, то авто двигаются с линиями (будто стоят)
        element.style.top = element.y + 'px';

        if (element.y >= document.documentElement.clientHeight) {
            element.y = -100 * setting.traffic;
            element.style.left = Math.floor(Math.random() * (gameArea.offsetWidth - 50)) + 'px'; //меняем позицию
        }

    });

    
}


