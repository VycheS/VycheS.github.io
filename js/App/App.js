class App {
    constructor() {
        // Создание карты.
        this._map = new ymaps.Map("map", {
            // Координаты центра карты: «широта, долгота».
            center: [52.033973, 113.499432],
            // Уровень масштабирования: от 0 (весь мир) до 19.
            zoom: 13,
            //включение или отключение элементов управления карты
            controls: ['zoomControl',/* 'typeSelector', */'fullscreenControl'],
            //включение или отключение способов взаимодействия с картой
            behaviors: [] //напиши:'drag' чтобы перемещать левой кнопкой мыши
        });
        //хранит все слои
        this._allLayot = new Array;
        //менеджер слоёв
        this.layerManager = new LayerManager(this._map, this._allLayot);
        //менеджер управления
        this.controlManager = new ControlManager(this._map, this._allLayot);
        //добавление события к форме модального окна
        document
            .querySelector('#newLayot')
            .setAttribute('onsubmit', 'app.createLayer(this.name.value, this.type.value)');
    }

    createLayer(name, type){
        let layot = this._allLayot.find(layot=>layot.name === name);
        if(layot == undefined){
            this.layerManager.add(name, type);
            this.controlManager.addItemToListBoxes(name);
            this.controlManager.selectEditItem(name);
            this.controlManager.highlightColor(name);
        } else {
            // TODO ПЕРЕПИСАТЬ НА МОДАЛЬНОЕ ОКНО
            alert(`Слой ${name} существует`);
        }
    }
    //test
    output(){
        let it = this._map.geoObjects.getIterator();
        let obj;
        while((obj = it.getNext()) != it.STOP_ITERATION){
            console.log(obj);
        }
    }

    //это для тестирования, смысла пока не имеет
    _sendToServer() {
        let data = {
            name: 'nn',
            val: 'vv'
        }

        //отправление данных на сервер
        fetch('test.php', { // файл-обработчик
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // отправляемые данные
            },
            body: JSON.stringify(data)
        })
            .then(response => alert('Сообщение отправлено'))
            .catch(error => console.error(error))
    }

}