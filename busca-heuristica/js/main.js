var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MinHeap } from './min-heap.js';
import { TRAIN_SPEED_IN_KILOMETERS_PER_HOUR, STATIONS, } from './data.js';
(() => {
    const departureStationSelectionDropdown = document.getElementById('departure-station-selection-dropdown');
    const destinationStationSelectionDropdown = document.getElementById('destination-station-selection-dropdown');
    const calculateRouteButton = document.getElementById('calculate-route-button');
    let selectedDepartureStation = null;
    let selectedDestinationStation = null;
    const updateCalculateRouteButtonAvailability = () => {
        if (selectedDepartureStation != null && selectedDestinationStation != null && selectedDepartureStation !== selectedDestinationStation) {
            calculateRouteButton.disabled = false;
        }
        else {
            calculateRouteButton.disabled = true;
        }
    };
    const clearInterface = () => {
        changeMapOpacity('show');
        document.getElementById('route-time-indicator').classList.add('hidden-element');
    };
    departureStationSelectionDropdown.addEventListener('sl-change', (event) => {
        selectedDepartureStation = event.target.value;
        updateCalculateRouteButtonAvailability();
        clearInterface();
    });
    destinationStationSelectionDropdown.addEventListener('sl-change', (event) => {
        selectedDestinationStation = event.target.value;
        updateCalculateRouteButtonAvailability();
        clearInterface();
    });
    calculateRouteButton.addEventListener('click', () => {
        const aStarResult = runAStarAlgorithm(selectedDepartureStation, selectedDestinationStation);
        const path = processAStarPath(aStarResult, selectedDepartureStation, selectedDestinationStation);
        const tripTime = aStarResult.get(selectedDestinationStation).realTimeFromDepartureToNodeInMinutes;
        updateInterfaceWithRoute(path, tripTime);
    });
})();
function runAStarAlgorithm(departureStation, destinationStation) {
    const estimatedTotalTimeGetter = (nodeData) => {
        return nodeData.realTimeFromDepartureToNodeInMinutes + nodeData.estimatedTimeFromNodeToDestinationInMinutes;
    };
    const openList = new MinHeap(estimatedTotalTimeGetter);
    openList.insert({
        station: departureStation,
        realTimeFromDepartureToNodeInMinutes: 0,
        estimatedTimeFromNodeToDestinationInMinutes: getEstimatedTripTimeInMinutes(departureStation, destinationStation)
    });
    const closedList = new Map();
    while (openList.size > 0) {
        let currentNode = openList.removeSmallest();
        if (currentNode.station === destinationStation) {
            return closedList;
        }
        const adjacentStations = STATIONS[currentNode.station].realDistances;
        for (const [adjacentStation, realDistance] of Object.entries(adjacentStations)) {
            if (realDistance != null) {
                const realTimeFromDepartureToNodeInMinutes = currentNode.realTimeFromDepartureToNodeInMinutes +
                    getRealTripTimeInMinutes(currentNode.station, adjacentStation);
                if (!closedList.has(adjacentStation) || realTimeFromDepartureToNodeInMinutes < closedList.get(adjacentStation).realTimeFromDepartureToNodeInMinutes) {
                    closedList.set(adjacentStation, {
                        station: currentNode.station,
                        realTimeFromDepartureToNodeInMinutes,
                        estimatedTimeFromNodeToDestinationInMinutes: getEstimatedTripTimeInMinutes(adjacentStation, destinationStation),
                    });
                    if (!openList.find(node => (node === null || node === void 0 ? void 0 : node.station) === adjacentStation)) {
                        openList.insert({
                            station: adjacentStation,
                            realTimeFromDepartureToNodeInMinutes,
                            estimatedTimeFromNodeToDestinationInMinutes: getEstimatedTripTimeInMinutes(adjacentStation, destinationStation),
                        });
                    }
                }
            }
        }
    }
}
function processAStarPath(aStarResult, departureStation, destinationStation) {
    const path = [destinationStation];
    while (path[0] !== departureStation) {
        path.unshift(aStarResult.get(path[0]).station);
    }
    return path;
}
function calculateTrainTimeInMinutes(distance) {
    return distance / TRAIN_SPEED_IN_KILOMETERS_PER_HOUR * 60;
}
function getEstimatedTripTimeInMinutes(departureStation, destinationStation) {
    return calculateTrainTimeInMinutes(STATIONS[departureStation].estimatedDistances[destinationStation]);
}
function getRealTripTimeInMinutes(departureStation, destinationStation) {
    return calculateTrainTimeInMinutes(STATIONS[departureStation].realDistances[destinationStation]);
}
function updateInterfaceWithRoute(path, tripTime) {
    return __awaiter(this, void 0, void 0, function* () {
        const routeTimeIndicator = document.getElementById('route-time-indicator');
        routeTimeIndicator.innerHTML = `Tempo da rota: <strong>${tripTime.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} minutos</strong>`;
        routeTimeIndicator.classList.remove('hidden-element');
        changeMapOpacity('fade');
        for (let i = 0; i + 1 < path.length; i++) {
            changeStationOpacity(path[i], 'show');
            changeLineStretchOpacity([path[i], path[i + 1]], 'show');
            changeStationOpacity(path[i + 1], 'show');
            yield delay(1000);
        }
    });
}
function changeMapOpacity(action) {
    const opacityStyleClasses = {
        fade: {
            toAdd: 'opacity-fade',
            toRemove: 'opacity-show'
        },
        show: {
            toAdd: 'opacity-show',
            toRemove: 'opacity-fade'
        }
    };
    for (const child of document.querySelector('svg.metro-map').children) {
        if (child.classList.contains('metro-station-dot')) {
            if (action === 'fade')
                child.classList.add('metro-station-dot-fade');
            if (action === 'show')
                child.classList.remove('metro-station-dot-fade');
        }
        else {
            child.classList.add(opacityStyleClasses[action].toAdd);
            child.classList.remove(opacityStyleClasses[action].toRemove);
        }
    }
}
function changeStationOpacity(station, action) {
    const opacityStyleClasses = {
        fade: {
            toAdd: 'opacity-fade',
            toRemove: 'opacity-show'
        },
        show: {
            toAdd: 'opacity-show',
            toRemove: 'opacity-fade'
        }
    };
    const dot = document.getElementById(`metro-station-dot-${station}`);
    const text = document.getElementById(`metro-station-text-${station}`);
    if (action === 'fade')
        dot.classList.add('metro-station-dot-fade');
    if (action === 'show')
        dot.classList.remove('metro-station-dot-fade');
    text.classList.add(opacityStyleClasses[action].toAdd);
    text.classList.remove(opacityStyleClasses[action].toRemove);
}
function changeLineStretchOpacity(stretch, action) {
    var _a;
    const opacityStyleClasses = {
        fade: {
            toAdd: 'opacity-fade',
            toRemove: 'opacity-show'
        },
        show: {
            toAdd: 'opacity-show',
            toRemove: 'opacity-fade'
        }
    };
    const lineStretch = (_a = document.getElementById(`metro-stretch-${stretch[0]}-${stretch[1]}`)) !== null && _a !== void 0 ? _a : document.getElementById(`metro-stretch-${stretch[1]}-${stretch[0]}`);
    lineStretch.classList.add(opacityStyleClasses[action].toAdd);
    lineStretch.classList.remove(opacityStyleClasses[action].toRemove);
}
function delay(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}
