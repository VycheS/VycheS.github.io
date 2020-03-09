class LayerManager {
    constructor(map) {
        this._map = map;
        //хранит все слои
        this._layersStorage = {};
    }

    add(name, type) {
        if (name in this._layersStorage) {
            return false;
        } else {
            if ((typeof (name) == 'string') && (type == 'point' || type == 'line' || type == 'broken_line')) {
                this._layersStorage[name] = new LayerGeoObj(this._map, name, type);
                return true;
            } else {
                console.log(new Error(`Нет возможности создать слой с такими параметрами (${name}, ${type})`));
            }
        }
    }

    on(name) {
        if (name in this._layersStorage) {
            this._layersStorage[name].on();
        } else {
            console.log(new Error(`Нет такого слоя или не задан вообще ни один`));
        }
    }

    off(name) {
        if (name in this._layersStorage) {
            this._layersStorage[name].off();
        } else {
            console.log(new Error(`Нет такого слоя или не задан вообще ни один`));
        }
    }

    getLayer(name){
        if (name in this._layersStorage) {
            return this._layersStorage[name];
        } else {
            console.error(`Возвращаемый слой:${name} отсутсвует`);
        }
    }
}