class ManagerButtonsGeoObj{
    constructor(){
        this._activeTypeGeoObj = undefined;
        this._buffer = new Array;
        this._typesLayers = ['point', 'line', 'broken_line'];
        //получаем и храним объекты кнопок выбора объектов
        this._objectButtons = {
            point: document.getElementById('point'),
            line: document.getElementById('line'),
            arrow: document.getElementById('arrow'),
            broken_line: document.getElementById('broken_line'),
            ok: document.getElementById('ok')
        }
        //добавляем события к кнопкам
        this._addEvent();
        //по умолчанию обнуляем состояние
        this.setTypeLayer();
    }

    _addEvent() {
        this._objectButtons.point.onclick = () => {
            while(this._buffer.length != 0){
                this._buffer.pop();
            };//очищаем
            this._activeTypeGeoObj = "point";
        }

        this._objectButtons.line.onclick = () => {
            while(this._buffer.length != 0){
                this._buffer.pop();
            };//очищаем
            this._activeTypeGeoObj = "line"
        }

        this._objectButtons.arrow.onclick = () => {
            while(this._buffer.length != 0){
                this._buffer.pop();
            };//очищаем
            this._activeTypeGeoObj = "arrow"
        }

        this._objectButtons.broken_line.onclick = () => {
            while(this._buffer.length != 0){
                this._buffer.pop();
            };//очищаем
            this._activeTypeGeoObj = 'broken_line';
        }

        this._objectButtons.ok.onclick = () => {
            while(this._buffer.length != 0){
                this._buffer.pop();
            };//очищаем
        }


    }

    //фн-ия отключения кнопок
    _access(buttons = new Array, options = undefined) {
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
    //в зависимости от слоя выставляем активную кнопку и активный тип геообъекта
    setTypeLayer(type = undefined){
        if ((type != undefined) && (this._typesLayers.some(item => item === type))) {//проверяем на сущ-ие и на наличие нужного нам значения
            //выcтавляем активное значение типа геообъекта в зависимости от приходящего типа слоя
            this._activeTypeGeoObj = type;
            //обнуляем все кроме выбранных
            if (type == 'point') {
                this._access([this._objectButtons.point], { disabled: false });
            } else if (type == 'line') {
                this._access([
                    this._objectButtons.line,
                    this._objectButtons.arrow
                ], { disabled: false });
            } else if (type == 'broken_line') {
                this._access([
                    this._objectButtons.broken_line,
                    this._objectButtons.ok
                ], { disabled: false });
            }
        } else {
            this._activeTypeGeoObj = undefined;//отключаем активный тип геообъекта
            this._access();//блокируем все кнопки
        }
    }
    //возвращаем активный тип геообъекта
    getActiveTypeGeoObj(){
        return this._activeTypeGeoObj;
    }

    getBuffer(){
        return this._buffer;
    }
}