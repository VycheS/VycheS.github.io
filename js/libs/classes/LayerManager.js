class LayerManager {
    constructor(map, allLayot) {
        this._map = map;
        //хранит все слои
        this._allLayot = allLayot;
    }

    add(name, type) {
        if ((typeof (name) == 'string') && (type == 'point' || type == 'line' || type == 'broken_line')) {
            this._allLayot.push({
                name: name,
                type: type,
                data: new Array
            });
        } else {
            console.log(new Error(`Нет возможности создать слой с такими параметрами (${name}, ${type})`));
        }

    }

    remove(name) {
        if (this._allLayot.length != 0) {
            //поиск елемента, если он существует то возвращается в переменную, если нет то он undefined
            let layot = this._allLayot.find(layot => layot.name === name);
            if (layot != undefined) {
                //при помощи indexOf получаем индекс элемента и удаляем в последующем
                this._allLayot.splice(this._allLayot.indexOf(layot), 1);
            } else {
                console.log(new Error(`Такого слоя не существует`));
            }
        } else {
            console.log(new Error(`Не задан ни один слой`));
        }
    }

    on(name) {
        if (this._allLayot.length != 0) {
            //поиск елемента, если он существует то возвращается в переменную, если нет то он undefined
            let layot = this._allLayot.find(layot => layot.name === name);
            if (layot != undefined) {
                //добавляем пообъектно на карту
                layot.data.forEach(obj => this._map.geoObjects.add(obj));
                // layot.data.forEach(obj => console.log(obj));
            } else {
                console.log(new Error(`Такого слоя не существует`));
            }
        } else {
            console.log(new Error(`Не задан ни один слой`));
        }
    }

    off(name) {
        let it = this._map.geoObjects.getIterator();
        let geoObj;
        let rmList = new Array();
        while ((geoObj = it.getNext()) != it.STOP_ITERATION) {
            if (geoObj.layot == name) {
                rmList.push(geoObj);
            }
        }
        while (rmList.length != 0) {
            this._map.geoObjects.remove(rmList.pop());
        }
    }
}