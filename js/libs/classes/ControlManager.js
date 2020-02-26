class ControlManager {
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
        this.layerManager = new LayerManager(map, allLayot);

        //------ВЫЗОВ МЕТОДОВ С ПОСЛЕДУЮЩЕЙ ИНИЦИАЛИЗАЦИЕЙ СВОЙСТВ------
        //создание списка редактирования слоёв
        this.editListBox = this._createEditListBox();
        //создание списка фильтра отображаемых слоёв
        this.filterListBox = this._createFilterListBox();

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
            floatIndex: 0
        });
        this._map.controls.add(this.editListBox, {
            floatIndex: 0
        });
    }

    addItemToListBoxes(name) {
        //ДОБАВЛЕНИЕ ЭЛЕМЕНТА В СПИСОК РЕДАКТОРА СЛОЁВ
        let newItemEdit = new ymaps.control.ListBoxItem({
            data: {
                content: name,
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
        //отключаем галочки не выбранных элементов
        while ((item = it.getNext()) != it.STOP_ITERATION) {
            if (item != newItemEdit) {
                item.deselect();
            }

        }

        //ДОБАВЛЕНИЕ ЭЛЕМЕНТА В СПИСОК ФИЛЬТРА СЛОЁВ
        let newItemFilter = new ymaps.control.ListBoxItem({
            data: {
                content: name,
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

            if (newItemFilter.isSelected()) {
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
                content: 'Редактор слоёв'
            },
            items: listItem
        });

        //добавление события к элементам списка
        editListBox.events.add('click', (e) => {
            //сохраняем выбранный элемент
            let item = e.get('target');
            //смотрим чтобы выбранный елемент не был родителем элемента
            if (item != editListBox) {
                //смотрим тип действия кнопки
                if (item.data.get('type_action') == 'add_layot') {
                    location.hash = "openModal"; //переход к id(открытие модального окна)
                    item.select(); // ставит галочку, но в данном случае она просто её отключает повторным нажатием
                } else {
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
                content: 'Фильтр слоёв'
            }
        });


        return filterListBox;
    }

    _addEventGeoObj(obj){//TODO сделать функцию добавления событий к объекту
        let stdColor;
        let typeIconColor;//для каждого типа своё свойство изменения объекта
        if (obj.geometry.getType() == 'Point') {
            typeIconColor = 'iconColor';
        } else {
            typeIconColor = 'strokeColor';
        }
        obj.events
        .add('mouseenter', function (e) {
            stdColor = e.get('target').options.get(typeIconColor);
            e.get('target').options.set(typeIconColor, '#28b463');
        })
        .add('mouseleave', function (e) {
            e.get('target').options.set(typeIconColor, stdColor);
        })
        //TODO сделать контекстное меню редактирования
        // .add('contextmenu', function (e) {
        //     // Если меню метки уже отображено, то убираем его.
        //     if ($('#menu').css('display') == 'block') {
        //         $('#menu').remove();
        //     } else {
        //         // HTML-содержимое контекстного меню.
        //         var menuContent =
        //             '<div id="menu">\
        //                 <ul id="menu_list">\
        //                     <li>Название: <br /> <input type="text" name="icon_text" /></li>\
        //                     <li>Подсказка: <br /> <input type="text" name="hint_text" /></li>\
        //                     <li>Балун: <br /> <input type="text" name="balloon_text" /></li>\
        //                 </ul>\
        //             <div align="center"><input type="submit" value="Сохранить" /></div>\
        //             </div>';
    
        //         // Размещаем контекстное меню на странице
        //         $('body').append(menuContent);
    
        //         // Задаем позицию меню.
        //         $('#menu').css({
        //             left: e.get('pagePixels')[0],
        //             top: e.get('pagePixels')[1]
        //         });
    
        //         // Заполняем поля контекстного меню текущими значениями свойств метки.
        //         $('#menu input[name="icon_text"]').val(myPlacemark.properties.get('iconContent'));
        //         $('#menu input[name="hint_text"]').val(myPlacemark.properties.get('hintContent'));
        //         $('#menu input[name="balloon_text"]').val(myPlacemark.properties.get('balloonContent'));
    
        //         // При нажатии на кнопку "Сохранить" изменяем свойства метки
        //         // значениями, введенными в форме контекстного меню.
        //         $('#menu input[type="submit"]').click(function () {
        //             myPlacemark.properties.set({
        //                 iconContent: $('input[name="icon_text"]').val(),
        //                 hintContent: $('input[name="hint_text"]').val(),
        //                 balloonContent: $('input[name="balloon_text"]').val()
        //             });
        //             // Удаляем контекстное меню.
        //             $('#menu').remove();
        //         });
        //     }
        // });
    }

    _addEventToMap() {
        //инициализация модуля стрелки
        let moduleArrow = ymaps.modules.require(['geoObject.Arrow']);
        //обработка событий мыши
        this._map.events.add(['dbclick', 'mousedown', 'mouseup'], (e) => {
            let eType = e.get('type');
            let options = {
                geodesic: true,
                strokeWidth: 5,
                opacity: 0.5,
                // Задаем цвет метки (в формате RGB).
                strokeColor: this.activeColor
            };
            switch (this._eventData.geoObjectType) {
                case "point":
                    if (eType == 'mouseup') {
                        let point = new ymaps.Placemark(e.get('coords'), null, {
                            // Задаем цвет метки (в формате RGB).
                            iconColor: this.activeColor
                        });
                        point.layot = this._selectedLayotEdit;
                        let layot = this._allLayot.find(layot => layot.name === this._selectedLayotEdit);
                        layot.data.push(point);
                        //TODO Сделать чтобы добавляло адекватно события к геообъекту
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
                        moduleArrow.spread((Arrow) => {
                            let arrow = new Arrow(this._eventData.arrayOfCoordinates, null, options);
                            arrow.layot = this._selectedLayotEdit;
                            let layot = this._allLayot.find(layot => layot.name === this._selectedLayotEdit);
                            //для того чтобы сохранить массив координат используем функцию глубокго копирования
                            layot.data.push(_.cloneDeep(arrow));
                            //TODO Сделать чтобы добавляло адекватно события к стрелке
                            this._addEventGeoObj(arrow);
                            this._map.geoObjects.add(arrow);
                            this._eventData.arrayOfCoordinates.length = 0;
                        });

                    }

                    break;

                case "line":
                    if (eType == 'mousedown') {
                        this._eventData.arrayOfCoordinates.push(e.get('coords'));
                    }
                    if (eType == 'mouseup') {
                        this._eventData.arrayOfCoordinates.push(e.get('coords'));
                        let line = new ymaps.Polyline(this._eventData.arrayOfCoordinates, null, options)
                        line.layot = this._selectedLayotEdit;
                        let layot = this._allLayot.find(layot => layot.name === this._selectedLayotEdit);
                        //для того чтобы сохранить массив координат используем функцию глубокго копирования
                        layot.data.push(_.cloneDeep(line));
                        //TODO Сделать чтобы добавляло адекватно события к линии
                        this._addEventGeoObj(line);
                        this._map.geoObjects.add(line);
                        this._eventData.arrayOfCoordinates.length = 0;
                    }

                    break;

                case "broken_line":
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
                        //TODO Сделать чтобы добавляло адекватно события к ломанной линии
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