const MAX_ENEMY = 7;
const HEIGHT_ELEM = 100;

const score = document.querySelector('.score'),
      start = document.querySelector('.start'),
      gameArea = document.querySelector('.gameArea'),
      car = document.createElement('div');

//добавление аудио
const audio = document.createElement('embed');
const crash = new Audio('crash.mp3');
audio.src = 'audio.mp3';
audio.type = 'audio/mp3';
audio.style.cssText = `position: absolute; top: -1000px;`;

car.classList.add('car');

//рассчитываем высоту дороги, кратную HEIGHT_ELEM без остатка
gameArea.style.height = Math.floor(document.documentElement.clientHeight / HEIGHT_ELEM) * HEIGHT_ELEM;

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
    speed: 0,
    traffic: 0, //плотность траффика (сложность игры)
    level: 0 //уровень. при каждой 1000 очков он уведичивается
};

let level = setting.level;


//фиксация набранных очков
const topScore = document.querySelector('#top-score');
const result = parseInt(localStorage.getItem('needForJs_score', setting.score));
topScore.textContent = `Best score: ${result ? result : 0}`;
//localStorage.clear();

//localStorage для хранения данных о набранных очках
const addLocalStorage = () => {
    if (result < setting.score) {
        localStorage.setItem('needForJs_score', setting.score);
        topScore.textContent = `Best score: ${setting.score}`;
    }
};

//ф-ция определяет, сколько нужно линий в зависимости от размера экрана
//получает высоту элемента и возвращает значение (кол-во эл-тов помещается)
function getQuantityElemenets(heightElement) {
   return (gameArea.offsetHeight / heightElement) + 1;
}

function startGame(event) {

    const target = event.target; //определяем, на что кликнули
    if (target === start) {  //кликнули на черный блок div - не реагируем
        return;
    }

    switch (target.id) { //кликнули на кнопку - проверяем id
        case 'easy':
            setting.speed = 3;
            setting.traffic = 4;
            break;
        case 'medium':
            setting.speed = 5;
            setting.traffic = 3;
            break;
        case 'hard':
            setting.speed = 8;
            setting.traffic = 2;
            break;
    }
    
    start.classList.add('hide');

    //очистка поля перед запуском (в случае столкновения)
    gameArea.innerHTML = '';

    //линия разделения
    for (let i = 0; i < getQuantityElemenets(HEIGHT_ELEM); i++) {
        const line = document.createElement('div');
        line.classList.add('line');
        line.style.top = `${i * HEIGHT_ELEM}px`; //расстояние от верха игорового пространства
        line.style.height = (HEIGHT_ELEM/2) + 'px';
        line.y = i * HEIGHT_ELEM; // для движения линий
        gameArea.append(line);
    }

    //создание автомобилей
    for (let i = 0; i < getQuantityElemenets(HEIGHT_ELEM * setting.traffic); i++) {
        const enemy = document.createElement('div');
        const randomEnemy = Math.floor(Math.random() * MAX_ENEMY) + 1;
        enemy.classList.add('enemy');

        const periodEnemy = -HEIGHT_ELEM * setting.traffic * (i + 1); //-100 т.е. другие авто выше поля игры
        enemy.y = periodEnemy < 100 ? -100 * setting.traffic * (i + 1) : periodEnemy;
        
        enemy.style.top = enemy.y +'px'; //расстояние от верха игорового пространства
        enemy.style.background = `transparent url(./image/enemy${randomEnemy}.png) center / cover no-repeat`;
        gameArea.append(enemy);
        enemy.style.left = Math.floor(Math.random() * (gameArea.offsetWidth - enemy.offsetWidth)) + 'px'; //расположение соперников
    }

    setting.score = 0;
    setting.start = true;
    
    gameArea.append(car);
    car.style.left = gameArea.offsetWidth/2 - car.offsetWidth/2;
    car.style.top = 'auto';
    car.style.bottom = '10px';

    document.body.append(audio);
    
    setting.x = car.offsetLeft; //от левого края блока родителя до элемента
    setting.y = car.offsetTop; //от края верха родителя до бампера авто
    requestAnimationFrame(playGame);
}

function playGame() {

    //проверка текущего уровня игры  и увеличение
    setting.level = Math.floor(setting.score / 1000);
    if (setting.level !== level) {
        level = setting.level;
        setting.speed += 1;
    }
    
    if (setting.start) {
        setting.score += setting.speed; //увеличение очков зависит от установок скорости
        score.innerHTML = 'SCORE:<br>' + setting.score;
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

        if (element.y >= gameArea.offsetHeight) {
            element.y = -HEIGHT_ELEM;
        }
    });
}

//ф-ция движения авто соперников
function moveEnemy() {
    let enemies = document.querySelectorAll('.enemy');

    enemies.forEach(function(element) {
       //позиция объекта, чтобы не сталкивались
       let carRect = car.getBoundingClientRect(); //позиция нашего авто
       let enemyRect = element.getBoundingClientRect(); //позиция соперника
       if (carRect.top <= enemyRect.bottom &&
           carRect.right >= enemyRect.left &&
           carRect.left <= enemyRect.right &&
           carRect.bottom >= enemyRect.top) {
           setting.start = false;
           audio.remove();
           console.warn('ДТП');
           crash.play();
           start.classList.remove('hide');
           start.style.top = score.offsetHeight; //кнопка start ниже score
           addLocalStorage();
       }
 
        element.y += setting.speed / 2; //если не разделим, то авто двигаются с линиями (будто стоят)
        element.style.top = element.y + 'px';

        if (element.y >= gameArea.offsetHeight) {
            element.y = -HEIGHT_ELEM * setting.traffic;
            element.style.left = Math.floor(Math.random() * (gameArea.offsetWidth - element.offsetWidth)) + 'px'; //меняем позицию
        }


        /*if (element.y >= gameArea.offsetHeight) {
            const checkTop = [...enemies].every(element => element.offsetTop > HEIGHT_ELEM);
            if (checkTop) {
                element.y = -HEIGHT_ELEM * setting.traffic;
            }
            element.style.left = Math.floor(Math.random() * (gameArea.offsetWidth - element.offsetWidth)) + 'px'; //меняем позицию
        }*/

    });
}


