import { MinHeap } from './min-heap.js';
import { TRAIN_SPEED_IN_KILOMETERS_PER_HOUR, LINE_EXCHANGE_TIME_IN_MINUTES, STATIONS, } from './data.js';
(() => {
    const departureStationSelectionDropdown = document.getElementById('departure-station-selection-dropdown');
    const destinationStationSelectionDropdown = document.getElementById('destination-station-selection-dropdown');
    const calculateRouteButton = document.getElementById('calculate-route-button');
    let selectedDepartureStation = null;
    let selectedDestinationStation = null;
    const updateCalculateRouteButtonAvailability = () => {
        if (selectedDepartureStation != null && selectedDestinationStation != null) {
            calculateRouteButton.disabled = false;
        }
        else {
            calculateRouteButton.disabled = true;
        }
    };
    departureStationSelectionDropdown.addEventListener('sl-change', (event) => {
        selectedDepartureStation = event.target.value;
        updateCalculateRouteButtonAvailability();
    });
    destinationStationSelectionDropdown.addEventListener('sl-change', (event) => {
        selectedDestinationStation = event.target.value;
        updateCalculateRouteButtonAvailability();
    });
    calculateRouteButton.addEventListener('click', () => {
        const aStarResult = runAStarAlgorithm(selectedDepartureStation, selectedDestinationStation);
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
    let isFinalDestination = false;
    while (openList.size > 0 && !isFinalDestination) {
        const currentNode = openList.removeSmallest();
        if (currentNode.station === destinationStation) {
            isFinalDestination = true;
        }
        else {
            const adjacentStations = STATIONS[currentNode.station].realDistances;
            for (const [adjacentStation, realDistance] of Object.entries(adjacentStations)) {
                if (realDistance != null) {
                    const realTimeFromDepartureToNodeInMinutes = currentNode.realTimeFromDepartureToNodeInMinutes +
                        getRealTripTimeInMinutes(currentNode.station, adjacentStation, null); // FIXME
                    if (!closedList.has(adjacentStation) || realTimeFromDepartureToNodeInMinutes < closedList.get(adjacentStation).realTimeFromDepartureToNodeInMinutes) {
                        closedList.set(currentNode.station, {
                            station: adjacentStation,
                            realTimeFromDepartureToNodeInMinutes,
                            estimatedTimeFromNodeToDestinationInMinutes: getEstimatedTripTimeInMinutes(adjacentStation, destinationStation)
                        });
                        openList.insert({
                            station: adjacentStation,
                            realTimeFromDepartureToNodeInMinutes,
                            estimatedTimeFromNodeToDestinationInMinutes: getEstimatedTripTimeInMinutes(adjacentStation, destinationStation)
                        });
                    }
                }
            }
        }
    }
}
function calculateTrainTimeInMinutes(distance) {
    return distance / TRAIN_SPEED_IN_KILOMETERS_PER_HOUR * 60;
}
function getEstimatedTripTimeInMinutes(departureStation, destinationStation) {
    return calculateTrainTimeInMinutes(STATIONS[departureStation].estimatedDistances[destinationStation]);
}
function getRealTripTimeInMinutes(departureStation, destinationStation, currentLine) {
    let tripTime = calculateTrainTimeInMinutes(STATIONS[departureStation].realDistances[destinationStation]);
    if (!STATIONS[destinationStation].lines.includes(currentLine)) {
        tripTime += LINE_EXCHANGE_TIME_IN_MINUTES;
    }
    return tripTime;
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
