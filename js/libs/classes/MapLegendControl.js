class MapLegendControl {
    constructor(layerManager){
        this._mapLegend = new ymaps.control.ListBox({
            data: {
                content: 'Легенда карты'
            }
        });
        //получаем менеджер слоёв
        this.layerManager = layerManager;
    }

    returnListBox(){
        return this._mapLegend;
    }

    addItem(name, type){
         let ico;//ссылка на иконку
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
         let newItem = new ymaps.control.ListBoxItem({
             data: {
                 content: content,
                 type_action: name
             },
             state: {
                 selected: true
             }
         });

         //добавляем событие к элементу
        newItem.events.add('click', () => {
            //если выбран включаем слой если не выбран отключаем отображаемый слой
            if (newItem.isSelected()) {
                this.layerManager.off(name);
            } else {
                this.layerManager.on(name);
            }
        });
        //добавляем в наш лист бокс
        this._mapLegend.add(newItem);
    }

    // rmItem(name){

    // }
}