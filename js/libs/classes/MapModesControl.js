class MapModesControl {
    constructor(map, editLayers) {
        //для последующего отключения включение режима редактирования
        this._map = map;
        //получаем кнопку которую будем вкл/откл в зависимости от режима
        this._editLayers = editLayers;
        //создаём кнопку
        this._mapModes = new ymaps.control.ListBox({
            data: {
                content: 'Режимы взаимодействия'
            },
            items: this._createItems()
        });
    }

    _createItems() {
        //создаём элемент для включения режима просмотра карты
        let view = new ymaps.control.ListBoxItem({
            data: {
                content: 'Просмотр'
            },
            state: {
                selected: true
            },
        });

        view.events.add('click', () => {
            //это условие для того чтобы галочка не отключалась при повторном нажатии
            if (view.isSelected()) {
                view.deselect();
            }
            //удаляем с карты кнопку "редактирования слоёв"
            this._map.controls.remove(this._editLayers.returnListBox(), {
                float: 'left',
                floatIndex: 50
            });
            //включаем на карте режим перемещения
            this._map.behaviors.enable(['drag']);
            //снимаем галочку с режима редактирования
            edit.deselect();
            //отключаем все галочки и блокируем кнопки
            this._editLayers.deselectAll();
        });


        //создаём элемент для включения режима редактирования карты
        let edit = new ymaps.control.ListBoxItem({
            data: {
                content: 'Редактирование'
            },
            state: {
                selected: false
            },
        });

        edit.events.add('click', () => {
            //это условие для того чтобы галочка не отключалась при повторном нажатии
            if (edit.isSelected()) {
                edit.deselect();
            }
            //добавляем на карту кнопку "редактирования слоёв"
            this._map.controls.add(this._editLayers.returnListBox(), {
                float: 'left',
                floatIndex: 50
            });
            //отключаем на карте режим перемещения
            this._map.behaviors.disable(['drag']);
            //снимаем галочку с режима просмотра
            view.deselect();
        });
        
        return [view, edit];
    }

    returnListBox() {
        return this._mapModes;
    }
}