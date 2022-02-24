import { MinHeap } from './min-heap.js';
import {
    StationIdentifier,
    MetroLine,
    TRAIN_SPEED_IN_KILOMETERS_PER_HOUR,
    LINE_EXCHANGE_TIME_IN_MINUTES,
    STATIONS,
} from './data.js';

(() => {
    const departureStationSelectionDropdown: any = document.getElementById('departure-station-selection-dropdown');
    const destinationStationSelectionDropdown: any = document.getElementById('destination-station-selection-dropdown');
    const calculateRouteButton: any = document.getElementById('calculate-route-button');
    let selectedDepartureStation: StationIdentifier = null;
    let selectedDestinationStation: StationIdentifier = null;
    
    const updateCalculateRouteButtonAvailability = () => {
        if (selectedDepartureStation != null && selectedDestinationStation != null) {
            calculateRouteButton.disabled = false;
        } else {
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
})()

function runAStarAlgorithm(departureStation: StationIdentifier, destinationStation: StationIdentifier) {
    type NodeData = {
        station: StationIdentifier,
        realTimeFromDepartureToNodeInMinutes: number,
        estimatedTimeFromNodeToDestinationInMinutes: number,
    }

    const estimatedTotalTimeGetter = (nodeData: NodeData) => {
        return nodeData.realTimeFromDepartureToNodeInMinutes + nodeData.estimatedTimeFromNodeToDestinationInMinutes;
    };

    const openList: MinHeap<NodeData> = new MinHeap<NodeData>(estimatedTotalTimeGetter);
    openList.insert({
        station: departureStation,
        realTimeFromDepartureToNodeInMinutes: 0,
        estimatedTimeFromNodeToDestinationInMinutes: getEstimatedTripTimeInMinutes(departureStation, destinationStation)
    })
    const closedList = new Map<StationIdentifier, NodeData>();
    
}

function calculateTrainTimeInMinutes(distance: number): number {
    return distance / TRAIN_SPEED_IN_KILOMETERS_PER_HOUR * 60
}

function getEstimatedTripTimeInMinutes(departureStation: StationIdentifier, destinationStation: StationIdentifier): number {
    return calculateTrainTimeInMinutes(STATIONS[departureStation].estimatedDistances[destinationStation]);
}

function getRealTripTimeInMinutes(departureStation: StationIdentifier, destinationStation: StationIdentifier, currentLine: MetroLine): number {
    let tripTime = calculateTrainTimeInMinutes(STATIONS[departureStation].realDistances[destinationStation]);
    if (!STATIONS[destinationStation].lines.includes(currentLine)) {
        tripTime += LINE_EXCHANGE_TIME_IN_MINUTES;
    }
    return tripTime;
}

function changeMapOpacity(action: 'fade' | 'show') {
    const opacityStyleClasses = {
        fade: {
            toAdd: 'opacity-fade',
            toRemove: 'opacity-show'
        },
        show: {
            toAdd: 'opacity-show',
            toRemove: 'opacity-fade'
        }
    }

    for (const child of document.querySelector('svg.metro-map').children) {
        if (child.classList.contains('metro-station-dot')) {
            if (action === 'fade') child.classList.add('metro-station-dot-fade');
            if (action === 'show') child.classList.remove('metro-station-dot-fade');
        } else {
            child.classList.add(opacityStyleClasses[action].toAdd);
            child.classList.remove(opacityStyleClasses[action].toRemove);
        }
    }
}

function changeStationOpacity(station: StationIdentifier, action: 'fade' | 'show') {
    const opacityStyleClasses = {
        fade: {
            toAdd: 'opacity-fade',
            toRemove: 'opacity-show'
        },
        show: {
            toAdd: 'opacity-show',
            toRemove: 'opacity-fade'
        }
    }

    const dot = document.getElementById(`metro-station-dot-${station}`);
    const text = document.getElementById(`metro-station-text-${station}`);

    if (action === 'fade') dot.classList.add('metro-station-dot-fade');
    if (action === 'show') dot.classList.remove('metro-station-dot-fade');

    text.classList.add(opacityStyleClasses[action].toAdd);
    text.classList.remove(opacityStyleClasses[action].toRemove);
}

function changeLineStretchOpacity(stretch: [StationIdentifier, StationIdentifier], action: 'fade' | 'show') {
    const opacityStyleClasses = {
        fade: {
            toAdd: 'opacity-fade',
            toRemove: 'opacity-show'
        },
        show: {
            toAdd: 'opacity-show',
            toRemove: 'opacity-fade'
        }
    }

    const lineStretch =
        document.getElementById(`metro-stretch-${stretch[0]}-${stretch[1]}`) ??
        document.getElementById(`metro-stretch-${stretch[1]}-${stretch[0]}`);

    lineStretch.classList.add(opacityStyleClasses[action].toAdd);
    lineStretch.classList.remove(opacityStyleClasses[action].toRemove);
}
