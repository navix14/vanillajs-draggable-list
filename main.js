class DraggableContainer {
    constructor(containerElement, itemClass) {
        this.container = containerElement;
        this.itemClass = itemClass;

        this.isDragging = false;
        this.draggedItem = null;
        this.pseudoItem = null;
        this.previewItem = null;

        this.dragPos = { x: 0, y: 0 };
        this.closestAbove = null;
        this.closestBelow = null;
    }

    init() {
        this.items = this.container.querySelectorAll(this.itemClass);

        for (const item of this.items) {
            item.addEventListener("mousedown", this.onItemSelected.bind(this));
            this.container.addEventListener("mousemove", this.onItemDragged.bind(this));
        }

        document.body.addEventListener("mouseup", this.onDragEnd.bind(this));
    }

    insertBetween(item, above, below) {
        if (above && below) {
            this.container.insertBefore(item, below);
        } else if (above) {
            this.container.appendChild(item);
        } else if (below) {
            this.container.prepend(item);
        }
    }

    findClosestItems(mousePos) {
        this.closestAbove = null;
        let distanceAbove = Number.MAX_VALUE;

        this.closestBelow = null;
        let distanceBelow = -Number.MAX_VALUE;

        // get closest item above and below
        for (const item of this.items) {
            if (item === this.draggedItem) continue;

            const box = item.getBoundingClientRect();

            // get midline
            const midline = box.top + box.height / 2;
            const cursorDistance = mousePos.y - midline;

            if (cursorDistance > 0 && cursorDistance < distanceAbove) {
                this.closestAbove = item;
                distanceAbove = cursorDistance;
            } else if (cursorDistance < 0 && cursorDistance > distanceBelow) {
                this.closestBelow = item;
                distanceBelow = cursorDistance;
            }
        }
    }

    onItemSelected(e) {
        // If not dragging or not left-click, return
        if (this.isDragging || e.button !== 0) return;

        // Define initial position where drag started
        this.dragPos = {
            x: e.clientX,
            y: e.clientY,
        };

        // Styling, not relevant to logic
        this.isDragging = true;
        this.draggedItem = e.target;
        this.draggedItem.classList.add("dragging");

        this.pseudoItem = this.draggedItem.cloneNode(true);
        this.pseudoItem.classList.add("pseudo");
        this.pseudoItem.style.top = `${this.draggedItem.offsetTop}px`;

        this.container.prepend(this.pseudoItem);
    }

    onItemDragged(e) {
        if (!this.isDragging) return;

        this.draggedItem.remove();
        this.pseudoItem.style.transform = `translate(${e.clientX - this.dragPos.x}px, ${e.clientY - this.dragPos.y}px)`;

        const oldClosestAbove = this.closestAbove;
        const oldClosestBelow = this.closestBelow;

        this.findClosestItems({
            x: e.clientX,
            y: e.clientY
        });

        // Only re-create preview node if position has changed
        if (oldClosestAbove != this.closestAbove || oldClosestBelow != this.closestBelow) {
            if (this.previewNode) {
                this.previewNode.remove();
            }

            this.previewNode = this.draggedItem.cloneNode(true);
            this.previewNode.style.color = "transparent";
            this.previewNode.classList.remove("dragging");
            this.previewNode.classList.add("preview");

            this.insertBetween(this.previewNode, this.closestAbove, this.closestBelow);

            setTimeout(() => {
                this.previewNode.classList.add("animate");
            }, 0);
        }
    }

    onDragEnd(e) {
        if (this.isDragging) {
            // Remove preview node
            this.previewNode.remove();
            this.container.removeChild(this.pseudoItem);
            this.draggedItem.classList.remove("dragging");

            this.insertBetween(this.draggedItem, this.closestAbove, this.closestBelow)

            this.isDragging = false;
            this.draggedItem = null;
            this.pseudoItem = null;
            this.closestAbove = null;
            this.closestBelow = null;
        }
    }
}

const container = document.querySelector(".container");

const draggableContainer = new DraggableContainer(container, ".item");
draggableContainer.init();