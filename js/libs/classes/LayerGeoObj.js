//для того чтобы модуль стрелки был перед использованием инициализирован
let moduleArrow = ymaps.modules.require(['geoObject.Arrow']);

class LayerGeoObj {
    constructor(map, name, type) {
        //карта с которой взаимодействуем
        this._map = map;
        //хранилище геообъектов
        this._storage = new Array;
        //имя слоя
        this._name = name;
        //тип слоя
        this._type = type;
    }

    add(typeGeoObj, coordinates, properties = {}, options = {}) {
        if (['point', 'line', 'arrow', 'broken_line'].includes(typeGeoObj)) {
            this._addToStorage(typeGeoObj, coordinates, properties, options);
            this._addToMap(typeGeoObj, coordinates, properties, options);
        } else console.error('неизвестный тип геообъекта');
    }

    //включаем отображение на карте
    on() {
        //для каждого элемента массива вызываем добавление на карту
        this._storage
            .forEach(obj => {
                this._addToMap(obj.typeGeoObj, obj.coordinates, obj.properties, obj.options);
            });
    }

    //отключаем отображение на карте
    off() {
        let it = this._map.geoObjects.getIterator();//возвращаем итератор объектов
        let obj; //объект временного хранения
        let rmList = new Array(); //собираем удаляемые элементы
        while ((obj = it.getNext()) != it.STOP_ITERATION) {
            if (obj.layerName == this._name) {
                rmList.push(obj);
            }
        }
        //удалаяем с карты собранные элементы
        while (rmList.length != 0) {
            this._map.geoObjects.remove(rmList.pop());
        }
    }

    _addEvent(obj) {
        obj.events
            .add('contextmenu', e => {
                //получаем хранилище объектов для последующей обработки в фукции
                let storage = this._storage;
                //тип открывающегося меню
                let typeMenu;
                //в зависимости от типа выбираем нужное окно
                if (obj.geometry.getType() == 'Point') {
                    typeMenu = 'menuPoint';
                } else {
                    typeMenu = 'menuLine';
                }
                //возвращаем в зависимости от типа
                let menu = document.querySelector('#' + typeMenu);
                //меняем координаты окна перед появлением
                menu.style.left = e.get('pagePixels')[0] + 'px';
                menu.style.top = e.get('pagePixels')[1] + 'px';
                //открываем окно "настройки геообъекта"
                location.hash = typeMenu;
                //добавляем обработку события для окна добавления опции к объекту
                menu.addEventListener('submit', function (e) {
                    //отключаем перезагрузку страницы при нажатии на submit
                    e.preventDefault();
                    //у окна линии нет названия объекта
                    if (obj.geometry.getType() == 'Point') {
                        //меняем заголовок объекта
                        obj.properties.set('iconCaption', this.iconText.value);
                        storage[obj.indexId].properties['iconCaption'] = this.iconText.value;//также в хранилище
                    }
                    //меняем подсказку объекта
                    obj.properties.set('hintContent', this.hintText.value);
                    storage[obj.indexId].properties['hintContent'] = this.hintText.value;//также в хранилище
                    //меняем балун обЪекта
                    obj.properties.set('balloonContent', this.balloonText.value);
                    storage[obj.indexId].properties['balloonContent'] = this.balloonText.value;//также в хранилище
                    //закрываем после ввода
                    location.hash = '#close';
                }, { once: true });//TODO возможно он здесь и не нужен теперь

            });
    }

    _addToStorage(typeGeoObj, coordinates, properties, options){
        //добавляем в хранилище объектов
        this._storage.push({
            typeGeoObj: typeGeoObj,
            coordinates: coordinates,
            properties: properties,
            options: options
        });
    }

    _addToMap(typeGeoObj, coordinates, properties, options){
        if (typeGeoObj == 'arrow') {//только так можно удобно обработать модуль стрелки
            //при помощи модуля стрелки создаём её на карте
            moduleArrow.spread(Arrow => {
                let obj = new Arrow(coordinates, properties, options);
                //добавляем метод к геообъекту при помощи которого мы сможем его отличать от других слоёв
                obj.layerName = this._name;
                //присваиваем id по индексу в массиве !!!!!!!!!в последующем если удалять через delete arr[5], то length не поменяется
                obj.indexId = this._storage.length - 1;
                //добавляем доп характеристики объекту
                this._addEvent(obj);
                //добавляем на карту
                this._map.geoObjects.add(obj);
                
            });

        } else {

            let obj;
            if (typeGeoObj == 'point') {
                obj = new ymaps.Placemark(coordinates, properties, options);
            } else if (typeGeoObj == 'line') {
                obj = new ymaps.Polyline(coordinates, properties, options);
            } else if (typeGeoObj == 'broken_line') {
                obj = new ymaps.Polyline(coordinates, properties, options);
            }
            //добавляем метод к геообъекту при помощи которого мы сможем его отличать от других слоёв
            obj.layerName = this._name;
            //присваиваем id по индексу в массиве !!!!!!!!!в последующем если удалять через delete arr[5], то length не поменяется
            obj.indexId = this._storage.length - 1;
            //добавляем доп характеристики объекту
            this._addEvent(obj);
            //добавляем на карту
            this._map.geoObjects.add(obj)
        }
    }
}