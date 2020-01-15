//для строгой проверки типов
"use strict";

/* Функция ymaps.ready() будет вызвана, когда загрузятся 
все компоненты API, а также когда будет готово DOM-дерево. */
ymaps.ready(main);

function main() {
    // Создание карты.
    let myMap = new ymaps.Map("map", {
        // Координаты центра карты: «широта, долгота».
        center: [52.033973, 113.499432],
        // Уровень масштабирования: от 0 (весь мир) до 19.
        zoom: 13,
        //включение или отключение элементов управления карты
        controls: ['zoomControl'],
        //включение или отключение способов взаимодействия с картой
        behaviors: [] //напиши:'drag' чтобы перемещать левой кнопкой мыши
    });


    //-------------------------canvas--------------------------
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    //задаём цвет
    ctx.fillStyle = 'red';

    let geoObjectType = "Point"

    buttonPoint.onclick = function() {
        geoObjectType = "Point";
    }

    buttonLine.onclick = function() {
        geoObjectType = "LineString"
    }

    buttonRectangle.onclick = function() {
        geoObjectType = "Rectangle"
    }

    canvas.onmousedown = function (event) {
        //хранилище положений мыши
        let mouse = { x: Uint16Array, y: Uint16Array };
        mouse.x = event.offsetX;
        mouse.y = event.offsetY;

        switch (geoObjectType) {
            case "Point":
                canvas.onmouseup = function (event) {

                    ctx.fillRect(mouse.x, mouse.y, 5, 5);
                    ctx.fill();
        
                    let coordinateOne = pageToCoordinates(myMap, mouse);
                    addGeoObject(myMap, geoObjectType, coordinateOne);
                }
            break;

            case "LineString":
                canvas.onmouseup = function (event) {

                    ctx.fillRect(mouse.x, mouse.y, 5, 5);
                    ctx.fill();
        
                    let coordinateOne = pageToCoordinates(myMap, mouse);

                    mouse.x = event.offsetX;
                    mouse.y = event.offsetY;

                    ctx.fillRect(mouse.x, mouse.y, 5, 5);
                    ctx.fill();

                    let coordinateTwo = pageToCoordinates(myMap, mouse);
                    addGeoObject(myMap, geoObjectType, coordinateOne, coordinateTwo);
                }
            break;

            case "Rectangle":
                canvas.onmouseup = function (event) {

                    ctx.fillRect(mouse.x, mouse.y, 5, 5);
                    ctx.fill();
        
                    let coordinateOne = pageToCoordinates(myMap, mouse);

                    mouse.x = event.offsetX;
                    mouse.y = event.offsetY;

                    ctx.fillRect(mouse.x, mouse.y, 5, 5);
                    ctx.fill();

                    let coordinateTwo = pageToCoordinates(myMap, mouse);
                    addGeoObject(myMap, geoObjectType, coordinateOne, coordinateTwo);
                }
            break;
        
            default:
            break;
        }
    }

}

//функция для добавления гео объекта
function addGeoObject(map, geoObjectType, coordinateOne, coordinateTwo = undefined) {
    // Создание геообъекта с типом точка (метка).
    let geoObject = Object;

    if (((geoObjectType == 'LineString') || (geoObjectType == 'Rectangle')) && (coordinateTwo != undefined)) {
        geoObject = {
            geometry: {
                type: geoObjectType, // тип геометрии
                coordinates: [
                    coordinateOne,
                    coordinateTwo
                ] // координаты
            }
        }
    } else if (geoObjectType == 'Point') {
        geoObject = {
            geometry: {
                type: geoObjectType, // тип геометрии
                coordinates: coordinateOne // координаты
            }
        }
    }

    let myGeoObject = new ymaps.GeoObject(geoObject);

    // Размещение геообъекта на карте.
    map.geoObjects.add(myGeoObject);
}

//функция для перевода локальных пикселей в глобальные координаты
function pageToCoordinates(map, locPixel) {
    //переводим локальные пиксельные координаты в глобальные пиксельные координаты
    let globalPixel = map.converter.pageToGlobal([locPixel.x, locPixel.y]);
    //вытаскиваем проекцию из карты
    let projection = map.options.get('projection');
    //переводим глоб.пиксельные координаты в координаты "широта, долгота"
    return projection.fromGlobalPixels(globalPixel, map.getZoom());
}





