class ControlManager {
    //TODO разделить контрол мэнеджер на мелкие классы
    constructor(map, allLayot) {
        //храним объекты кнопок выбора объектов
        this._objectButtons = {
            point: document.getElementById('point'),
            line: document.getElementById('line'),
            arrow: document.getElementById('arrow'),
            broken_line: document.getElementById('broken_line'),
            ok: document.getElementById('ok')
        }
        this.activeColor = '#900000';

        this.notActiveColor = '#0051ff';
        //------ИНИЦИАЛИЗАЦИЯ СВОЙСТВ ОТ ВЛОЖЕННЫХ ПАРАМЕТРОВ------
        this._map = map;
        //хранит все слои
        this._allLayot = allLayot;

        //--LayotManager для тестирования
        this.layerManager = new LayerManager(map, allLayot); //TODO по возможности убрать т.к. есть в App, или придумай хорошее решение

        //------ВЫЗОВ МЕТОДОВ С ПОСЛЕДУЮЩЕЙ ИНИЦИАЛИЗАЦИЕЙ СВОЙСТВ------
        //создание списка редактирования слоёв
        this.editListBox = this._createEditListBox();
        //создание списка фильтра отображаемых слоёв
        this.filterListBox = this._createFilterListBox(); //Легенда карты

        //------ВЫЗОВ МЕТОДОВ------
        //события кнопок выбора объектов
        this._addEventToObjButtons();
        //добавление объектов на карту
        this._addEventToMap();

        this._accessObjectButtons();

        //------ИНИЦИАЛИЗАЦИЯ СВОЙСТВ------
        //хранит имя выбранного редактируемого слоя
        this._selectedLayotEdit = undefined;
        //данные типа кнопки и массива координат
        this._eventData = { geoObjectType: '', arrayOfCoordinates: new Array() }
        //добавление списков на карту
        this._map.controls.add(this.filterListBox, {
            float: 'right',
            floatIndex: 0
        });
        this._map.controls.add(this.editListBox, {
            floatIndex: 0
        });
    }

    addItemToListBoxes(name, type) {
        //ДОБАВЛЕНИЕ ЭЛЕМЕНТА В СПИСОК РЕДАКТОРА СЛОЁВ
        let newItemEdit = new ymaps.control.ListBoxItem({
            data: {
                content: 'режим ред.: ' + name,
                type_action: name
            },
            state: {
                selected: true
            }
        });
        //добавляем событие к элементу
        newItemEdit.events.add('click', () => {
            //высталяем выбранный
            this._selectedLayotEdit = name;
            //выставляем кнопки
            this.selectEditItem(name);
            //выделяем цветом актвный
            this.highlightColor(name);
        });
        //добавляем новый элемент в лист бокс
        this.editListBox.add(newItemEdit);

        let it = this.editListBox.getIterator();//возвращаем итератор элементов
        let item;//хранит элементы списка
        let tmpItemNewLayer; //хранит кнопку добавления нового слоя, для того чтобы удалить и добавить заного, для смещения вниз
        //отключаем галочки не выбранных элементов
        while ((item = it.getNext()) != it.STOP_ITERATION) {
            if (item != newItemEdit) {
                item.deselect();
            }
            if(item.data.get('type_action') == 'add_layot'){
                tmpItemNewLayer = item;
                this.editListBox.remove(tmpItemNewLayer);
            }
        }
        this.editListBox.add(tmpItemNewLayer);



        //ДОБАВЛЕНИЕ ЭЛЕМЕНТА В СПИСОК ФИЛЬТРА СЛОЁВ ну или ЛЕГЕНДА
        let ico;
        let heigtIcoPx = 15; //высота икнонки в пикселях
        let ln = '';//пробел
        if (type == 'point') {
            ico = '<img height="' + heigtIcoPx + '" src="/img/point.png" alt="точка">';
            ln = '&#8195'
        } else if(type == 'line') {
            ico = '<img height="' + heigtIcoPx + '" src="/img/line.png" alt="линия">';
        } else if(type == 'broken_line') {
            ico = '<img height="' + heigtIcoPx + '" src="/img/broken_line.png" alt="ломанная линия">';
        }
        let content = ln + ico + ln + ' - ' + name;
        let newItemFilter = new ymaps.control.ListBoxItem({
            data: {
                content: content,
                type_action: name
            },
            state: {
                selected: true
            }
        });
        //добавляем событие к элементу
        newItemFilter.events.add('click', () => {
            //высталяем выбранный
            this._layotFilter = name;

            if (newItemFilter.isSelected()) {//BUG при удалении линии и последующем добавлении пропадают её характеристики
                this.layerManager.off(name);
            } else {
                //для того чтобы не возника асинхронизации отображения,
                //страхуем промисом перекраску активного слоя после отображения на карте
                new Promise((resolve) => {
                    this.layerManager.on(name);
                    resolve();
                }).then(() => this.highlightColor(this._selectedLayotEdit));
            }
        });
        //добавляем новый элемент в лист бокс
        this.filterListBox.add(newItemFilter);
    }

    //изменение цвета в зависимости от активности
    highlightColor(name, activeColor = this.activeColor, notActiveColor = this.notActiveColor) {
        //изменяем цвет остальных объектов
        let it = this._map.geoObjects.getIterator();
        let geoObj;
        while ((geoObj = it.getNext()) != it.STOP_ITERATION) {
            if (geoObj.layot != name) {
                if (geoObj.geometry.getType() == 'Point') {
                    geoObj.options.set('iconColor', notActiveColor);
                } else {
                    geoObj.options.set('strokeColor', notActiveColor);
                }
            }
            else {
                if (geoObj.geometry.getType() == 'Point') {
                    geoObj.options.set('iconColor', activeColor);
                } else {
                    geoObj.options.set('strokeColor', activeColor);
                }
            }
        }

    }

    //TODO Удаление элементов с листбоксов
    removeItemToListBoxes() {

    }

    selectEditItem(name) {
        let layot = this._allLayot.find(layot => layot.name === name);
        if (layot != undefined) {
            //выбираем кнопку в зависимости от типа слоя
            this._eventData.geoObjectType = layot.type;
            //обнуляем все кроме выбранных
            if (layot.type == 'point') {
                this._accessObjectButtons([this._objectButtons.point], { disabled: false });
            } else if (layot.type == 'line') {
                this._accessObjectButtons([
                    this._objectButtons.line,
                    this._objectButtons.arrow
                ], { disabled: false });
            } else if (layot.type == 'broken_line') {
                this._accessObjectButtons([
                    this._objectButtons.broken_line,
                    this._objectButtons.ok
                ], { disabled: false });
            }
            this._selectedLayotEdit = name;
        } else {
            this._selectedLayotEdit = undefined;
        }

    }

    //фн-ия отключения кнопок
    _accessObjectButtons(buttons = new Array, options = undefined) {
        let stdOptions = {
            disabled: true,
            invertRemaining: true
        }
        //защита от неправильных элементов вложенных в options
        if ((options !== undefined) && (typeof (options) === 'object')) {
            if (('disabled' in options) && (typeof (options.disabled) === 'boolean')) {
                stdOptions.disabled = options.disabled;
            }
            if (('invertRemaining' in options) && (typeof (options.invertRemaining) === 'boolean')) {
                stdOptions.invertRemaining = options.invertRemaining;
            }
        }

        if (typeof (buttons) !== 'object') {//проверка buttons на тип
            console.error('buttons not object');
        } else if (buttons.length == 0) {//если пуст то тогда применяем stdOptions.disabled на все кнопки
            for (let key in this._objectButtons) {
                this._objectButtons[key].disabled = stdOptions.disabled;
            }
        } else {
            let remaining = new Array;//хранит оставшиеся
            for (let key in this._objectButtons) {
                if (buttons.find(button => button === this._objectButtons[key])) {
                    this._objectButtons[key].disabled = stdOptions.disabled;
                } else {//складываем к которым не применяем свойство
                    remaining.push(this._objectButtons[key]);
                }
            }
            //если включена опция 'ивнверсии оставшихся', тогда к ним примениться инвертированная опция disabled
            if (stdOptions.invertRemaining && remaining.length != 0) {
                for (let i = 0; i < remaining.length; i++) {
                    remaining[i].disabled = !stdOptions.disabled;
                }
            }
        }


    }

    _createEditListBox() {
        //создание элемента пользовательского списка
        let listItem = [
            new ymaps.control.ListBoxItem({
                data: {
                    content: 'режим сдвига карты <img height="15" src="/img/hand.jpg">',
                    type_action: 'drag'
                },
                state: {
                    selected: true
                },
            }),
            new ymaps.control.ListBoxItem({
                data: {
                    content: '<strong>+</strong> добавить слой',
                    type_action: 'add_layot'
                },
                state: {
                    selected: false
                },
            })
        ];

        //создание пользовательского списка с вложением элемента
        let editListBox = new ymaps.control.ListBox({
            data: {
                content: 'Редактор карты'
            },
            items: listItem
        });

        //добавление события к элементам списка
        editListBox.events.add('click', e => {
            //сохраняем выбранный элемент
            let item = e.get('target');
            //смотрим чтобы выбранный елемент не был родителем элемента
            if (item != editListBox) {
                //смотрим тип действия кнопки
                if (item.data.get('type_action') == 'add_layot') {
                    this._map.behaviors.disable(['drag']);
                    location.hash = "openModal"; //переход к id(открытие модального окна)
                    item.select(); // ставит галочку, но в данном случае она просто её отключает повторным нажатием
                } else if (item.data.get('type_action') == 'drag') {
                    //включаем на карте режим перемещения
                    this._map.behaviors.enable(['drag']);
                    //блокируем кнопки
                    this._accessObjectButtons();
                    //блокируем режим нанесения
                    this._eventData.geoObjectType = '';
                    //перекрашиваем всех в неактивный цвет
                    this.highlightColor(undefined);
                    //снимаем режим редактирвания со слоя
                    this._selectedLayotEdit = undefined;

                    let it = this.editListBox.getIterator();//возвращаем итератор элементов
                    let item;//хранит элементы списка
                    //отключаем галочки не выбранных элементов
                    while ((item = it.getNext()) != it.STOP_ITERATION) {
                        item.deselect();
                    }
                } else {
                    this._map.behaviors.disable(['drag']);
                    let it = this.editListBox.getIterator();//возвращаем итератор элементов
                    let item;//хранит элементы списка
                    //отключаем галочки не выбранных элементов
                    while ((item = it.getNext()) != it.STOP_ITERATION) {
                        item.deselect();
                    }
                }

            }
        });

        return editListBox;
    }

    _createFilterListBox() {
        //создание отображения фильтра слоёв
        let filterListBox = new ymaps.control.ListBox({
            data: {
                content: 'Легенда карты'
            }
        });


        return filterListBox;
    }

    _addEventGeoObj(obj) {
        // //предыдущий цвет
        // let stdColor;
        // //для каждого типа своё свойство изменения объекта
        // let typeIconColor;
        // //меняем ключ в зависимости от типа объекта
        // if (obj.geometry.getType() == 'Point') {
        //     typeIconColor = 'iconColor';
        // } else {
        //     typeIconColor = 'strokeColor';
        // }

        obj.events
            // .add('mouseenter', e => {
            //     stdColor = e.get('target').options.get(typeIconColor);
            //     e.get('target').options.set(typeIconColor, '#28b463');
            // })
            // .add('mouseleave', e => {
            //     e.get('target').options.set(typeIconColor, stdColor);
            // })
            .add('contextmenu', e => {
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
                    e.preventDefault();
                    //у окна линии нет названия объекта
                    if (obj.geometry.getType() == 'Point') {
                        obj.properties.set('iconCaption', this.iconText.value);
                    }
                    obj.properties.set('hintContent', this.hintText.value);
                    obj.properties.set('balloonContent', this.balloonText.value);
                    //закрываем после ввода
                    location.hash = '#close';
                }, { once: true });

            })
    }

    _addEventToMap() {
        //инициализация модуля стрелки
        let moduleArrow = ymaps.modules.require(['geoObject.Arrow']);
        //обработка событий мыши
        this._map.events.add(['mousedown', 'mouseup'], e => {
            let eType = e.get('type');
            let options = {
                geodesic: true,
                strokeWidth: 5,
                opacity: 0.5,
                // Задаем цвет метки (в формате RGB).
                strokeColor: this.activeColor
            };
            switch (this._eventData.geoObjectType) {//TODO убрать глубокое копирование со стрелки, линии и ломанной линии
                case "point":
                    if (eType == 'mouseup') {
                        let point = new ymaps.Placemark(e.get('coords'), null, {
                            // Задаем цвет метки (в формате RGB).
                            iconColor: this.activeColor
                        });
                        point.layot = this._selectedLayotEdit;
                        let layot = this._allLayot.find(layot => layot.name === this._selectedLayotEdit);
                        layot.data.push(point);
                        this._addEventGeoObj(point);
                        this._map.geoObjects.add(point);
                    }

                    break;

                case "arrow":
                    if (eType == 'mousedown') {
                        this._eventData.arrayOfCoordinates.push(e.get('coords'));
                    }
                    if (eType == 'mouseup') {
                        this._eventData.arrayOfCoordinates.push(e.get('coords'));
                        moduleArrow.spread(Arrow => {
                            //создаём объект стрелка
                            let arrow = new Arrow(this._eventData.arrayOfCoordinates, null, options);
                            //добавляем ему новое св-во при помощи которого мы сможем его находить на карте
                            arrow.layot = this._selectedLayotEdit;
                            //ищем по названию слоя и добавляем в нужный массив
                            let layot = this._allLayot.find(layot => layot.name === this._selectedLayotEdit);
                            //для того чтобы сохранить массив координат используем функцию глубокго копирования
                            layot.data.push(_.cloneDeep(arrow));
                            this._addEventGeoObj(arrow);//добавляем доп характеристики объекту
                            this._map.geoObjects.add(arrow);//добавляем на карту
                            this._eventData.arrayOfCoordinates.length = 0;//обнуляем счётчик хранилища координат
                        });

                    }

                    break;

                case "line":
                    if (eType == 'mousedown') {
                        this._eventData.arrayOfCoordinates.push(e.get('coords'));
                    }
                    if (eType == 'mouseup') {
                        this._eventData.arrayOfCoordinates.push(e.get('coords'));
                        //создаём объект линия
                        let line = new ymaps.Polyline(this._eventData.arrayOfCoordinates, null, options)
                        //добавляем ему новое св-во при помощи которого мы сможем его находить на карте
                        line.layot = this._selectedLayotEdit;
                        //ищем по названию слоя и добавляем в нужный массив
                        let layot = this._allLayot.find(layot => layot.name === this._selectedLayotEdit);
                        //для того чтобы сохранить массив координат используем функцию глубокго копирования
                        layot.data.push(_.cloneDeep(line));
                        this._addEventGeoObj(line);//добавляем доп характеристики объекту
                        this._map.geoObjects.add(line);//добавляем на карту
                        this._eventData.arrayOfCoordinates.length = 0;//обнуляем счётчик хранилища координат
                    }

                    break;
                
                case "broken_line"://TODO Сделать добавление не кусками а полностью
                    if (eType == 'mouseup') {
                        if (this._eventData.arrayOfCoordinates.length >= 2) {
                            this._eventData.arrayOfCoordinates.shift();
                        }
                        this._eventData.arrayOfCoordinates.push(e.get('coords'));
                        let lineString = new ymaps.Polyline(this._eventData.arrayOfCoordinates, null, options)
                        lineString.layot = this._selectedLayotEdit;
                        let layot = this._allLayot.find(layot => layot.name === this._selectedLayotEdit);
                        //для того чтобы сохранить массив координат используем функцию глубокго копирования
                        layot.data.push(_.cloneDeep(lineString));
                        this._addEventGeoObj(lineString);
                        this._map.geoObjects.add(lineString);
                    }

                    break;
            }


        });
    }

    _addEventToObjButtons() {
        this._objectButtons.point.onclick = () => {
            this._eventData.arrayOfCoordinates.length = 0;
            this._eventData.geoObjectType = "point";
        }

        this._objectButtons.line.onclick = () => {
            this._eventData.arrayOfCoordinates.length = 0;
            this._eventData.geoObjectType = "line"
        }

        this._objectButtons.arrow.onclick = () => {
            this._eventData.arrayOfCoordinates.length = 0;
            this._eventData.geoObjectType = "arrow"
        }

        this._objectButtons.broken_line.onclick = () => {
            this._eventData.arrayOfCoordinates.length = 0;
            this._eventData.geoObjectType = 'broken_line';
        }

        this._objectButtons.ok.onclick = () => {
            this._eventData.arrayOfCoordinates.length = 0;
        }


    }
}