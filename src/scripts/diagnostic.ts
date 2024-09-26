/*
 * HOVER AND CURSOR MEDIA QUERIES
 */

const mediaQueryInputs = [
    "(pointer:none)",
    "(pointer:coarse)",
    "(pointer:fine)",
    "(hover:none)",
    "(hover:hover)",
    "(any-pointer:none)",
    "(any-pointer:coarse)",
    "(any-pointer:fine)",
    "(any-hover:none)",
    "(any-hover:hover)",
];

function createAndAddElementToRow(queryString: string, rowType: string, inputString: string) {
    const row = document.querySelector(queryString);
    if (!row) {
        return;
    }
    const cell = document.createElement(rowType);
    cell.innerHTML = `<td>${inputString}</td>`;
    row.appendChild(cell);
}

function readMediaQueries() {
    mediaQueryInputs.forEach((inputString) => {
        const mediaQueryResult = window.matchMedia && window.matchMedia(inputString).matches;
        createAndAddElementToRow("#diagnostic-header-row", "th", inputString);
        createAndAddElementToRow("#diagnostic-result-row", "td", mediaQueryResult.toString());
    });
}

/*
 * MOUSE AND TOUCH EVENTS FIRED ON CLICK
 */
const touchTypes = [
    "MSPointerDown",
    "MSPointerUp",
    "MSPointerCancel",
    "MSPointerMove",
    "MSPointerOver",
    "MSPointerOut",
    "MSPointerEnter",
    "MSPointerLeave",
    "MSGotPointerCapture",
    "MSLostPointerCapture",
    "pointerdown",
    "pointerup",
    "pointercancel",
    "pointermove",
    "pointerover",
    "pointerout",
    "pointerenter",
    "pointerleave",
    "gotpointercapture",
    "lostpointercapture",
    "touchstart",
    "touchmove",
    "touchend",
    "touchenter",
    "touchleave",
    "touchcancel",
    "mouseover",
    "mousemove",
    "mouseout",
    "mouseenter",
    "mouseleave",
    "mousedown",
    "mouseup",
    "focus",
    "blur",
    "click",
    "webkitmouseforcewillbegin",
    "webkitmouseforcedown",
    "webkitmouseforceup",
    "webkitmouseforcechanged",
];

function registerTouchInputHandlers() {
    const output = document.querySelector("#diagnostic-output")!;
    const target = document.querySelector("#diagnostic-event-target")!;
    touchTypes.forEach((eventType) => {
        target.addEventListener(eventType, (e) => {
            const newNode = document.createTextNode(e.type);

            output.appendChild(newNode);
            output.appendChild(document.createElement("br"));
            output.scrollTop = output.scrollHeight;
        });
    });
}

/*
 * OBJECT INFORMATION
 */

// Object utility methods

function copyOwnAndInheritedProperties(obj: any) {
    const result: { [key: string]: any } = {};
    for (const key in obj) {
        result[key] = obj[key];
    }
    return result;
}

const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (_key: string, value: any) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};

// Meat and potatoes
function addObjectToOutput(title: string, obj: { [key: string]: any } | undefined) {
    const outputElem = document.querySelector("#diagnostic-object-output")!;

    let output = "";
    try {
        output = JSON.stringify(copyOwnAndInheritedProperties(obj), getCircularReplacer(), 2);
    } catch (error) {
        console.error(error);
        output = `Can't log ${title}.`;
    }
    const outputEntry = document.createElement("div");
    outputEntry.classList.add("diagnostic-object-entry");
    outputEntry.innerHTML = `<div class="diagnostic-object-title">${title}</div><pre>${output}</pre>`;
    outputElem.appendChild(outputEntry);
}

function addEventHarvesterFor(eventName: string) {
    const harvesterElem = document.querySelector("#diagnostic-object-event-harvester")!;

    const listenerClosure = (event: Event) => {
        addObjectToOutput(eventName, event);
        if (event instanceof TouchEvent) {
            addObjectToOutput(eventName + ".touches[0]", event.touches["0"]);
        }
        harvesterElem.removeEventListener(eventName, listenerClosure);
    };
    harvesterElem.addEventListener(eventName, listenerClosure);
}

function readObjectInformation() {
    const objectsToOutput = [
        "window",
        "screen",
        "window.navigator",
        "window.screen",
        "window.visualViewport",
    ];
    objectsToOutput.forEach((objectPath) => addObjectToOutput(objectPath, eval(objectPath)));

    const eventsToHarvest = [
        "touchstart",
        "touchend",
        "touchmove",
        "mousedown",
        "mouseup",
        "mousemove",
        "click",
        "pointerdown",
        "pointerup",
        "pointermove",
    ];
    // Note: Causes errors when run in an iframe, since the stringification
    // tries to escape. Run in "debug" view for results.
    eventsToHarvest.forEach((eventName) => addEventHarvesterFor(eventName));
}

/*
 * GENERAL INFO GRAB BAG
 */
function createAndAddInfoToGrabBag(title: string, text: string) {
    const outputElem = document.querySelector("#diagnostic-grab-bag-output")!;
    const outputEntry = document.createElement("div");
    outputEntry.classList.add("diagnostic-object-entry");
    outputEntry.innerHTML = `<div class="diagnostic-object-title">${title}</div><div class="diagnostic-content">${text}</div>`;
    outputElem.appendChild(outputEntry);
}

function grabMiscInformation() {
    createAndAddInfoToGrabBag("window.devicePixelRatio", eval("window.devicePixelRatio"));

    createAndAddInfoToGrabBag(
        "WebGL Info",
        (() => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("webgl", {
                // This hints to use discreet GPU if available. Our main WebGL renderer also uses this.
                powerPreference: "high-performance",
            });

            if (context) {
                const debugInfo = context.getExtension("WEBGL_debug_renderer_info");
                if (debugInfo) {
                    return context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                }
            }
        })(),
    );
}

function createPersistentOutput(title: string, id: string) {
    const outputElem = document.querySelector("#diagnostic-grab-bag-output")!;
    const outputEntry = document.createElement("div");
    outputEntry.classList.add("diagnostic-object-entry");
    outputEntry.innerHTML = `<div class="diagnostic-object-title">${title}:</div><div class="diagnostic-content" id="${id}"></div>`;
    outputElem.appendChild(outputEntry);
}

function registerPersistentListeners() {
    const visualViewportResizeId = "visualViewportResize";
    const windowResizeId = "windowResize";
    createPersistentOutput("Visual viewport size", visualViewportResizeId);
    createPersistentOutput("Window size", windowResizeId);

    const viewport = window.visualViewport;
    if (!viewport) {
        console.error("Visual viewport not supported");
        return;
    }

    viewport.addEventListener("resize", () => {
        const sizeString = `width: ${viewport.width}, height: ${viewport.height}`;
        document.querySelector("#" + visualViewportResizeId)!.innerHTML = sizeString;
    });
    window.addEventListener("resize", () => {
        const sizeString = `width: ${window.innerWidth}, height: ${window.innerHeight}`;
        document.querySelector("#" + windowResizeId)!.innerHTML = sizeString;
    });
}

readMediaQueries();
registerTouchInputHandlers();
readObjectInformation();
grabMiscInformation();
registerPersistentListeners();
