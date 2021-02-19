/*
    DragElement by Jim Andrews, 2/18/2021

    You are free to use this code as you please. However, if you find
    any bugs in it, please fix them, let me know, and make the fix
    available. 
*/
function DragElement(aElement, aCage) {
    /*  * Constructs an object that makes aElement draggable. 
        * aElement is the element (or its id) that becomes draggable. 
        * aCage is is an optional element (or its id) that aElement stays within. 
        * aCage does not have to be the parent of aElement.
        * The CSS position property of aElement cannot be static (the default value).
    */
    //********************************************************************
    // PROPERTIES
    //********************************************************************

    var pPointerDown;
    var pConstraint;
    var pElement;
    var pOffsetX, pOffsetY;

    //********************************************************************
    // METHODS
    //********************************************************************

    this.setCage = function(cage) {
        // cage can be an element or its id. It is the (optional)
        // element that pElement stays within when pElement is dragged.
        if (typeof cage == 'string') {
            pConstraint = document.getElementById(cage);
        }
        else {
            pConstraint = cage;
        }
    }

    this.deactivate = function() {
        // Deactivates the ability of pElement to be dragged.
        pPointerDown = false; 
        window.removeEventListener('mousedown', mDown, false);
        window.removeEventListener('mousemove', mMove);
        window.removeEventListener('mouseup', mUp);
        window.removeEventListener('touchstart', tStart, false);
        window.removeEventListener('touchmove', tMove, false);
        window.removeEventListener('touchend', tEnd, false); 
    }

    this.reactivate = function() {
        // Reactivates ability to drag pElement.
        this.deactivate();
        pElement.addEventListener('mousedown', mDown, false);
        pElement.addEventListener('touchstart', tStart, false);
    }

    //********************************************************************
    // MOUSE
    //********************************************************************

    function mDown(e) {
        // Runs on mousedown. 
        pPointerDown = true; 
        var e = e || window.event;
        if (pElement.tagName == "IMG") e.preventDefault();
        var elementClientRect = pElement.getBoundingClientRect();
        pOffsetX = e.clientX - elementClientRect.left;
        pOffsetY = e.clientY - elementClientRect.top;
        window.addEventListener('mousemove', mMove, false);
        window.addEventListener('mouseup', mUp, false);
        // These event listeners are removed when the mouse goes up.
        return true;
    }

    function mMove(e) {
        var e = e || window.event;
        if (pElement.tagName == "IMG") e.preventDefault();
        moveElement(e.clientX, e.clientY);
    }

    function mUp(e) {
        // Called when the mouse goes up.
        pPointerDown = false;
        window.removeEventListener('mousemove', mMove);
        window.removeEventListener('mouseup', mUp);
    }

    //********************************************************************
    // TOUCH
    //********************************************************************

    function tStart(e) {
        // Runs on touchstart
        pPointerDown = true;  
        var e = e || window.event;
        e.preventDefault();
        var elementClientRect = pElement.getBoundingClientRect();
        pOffsetX = e.touches[0].clientX - elementClientRect.left;
        pOffsetY = e.touches[0].clientY - elementClientRect.top;
        window.addEventListener('touchend', tEnd, false);
        window.addEventListener('touchmove', tMove, false);
        // These event listeners are removed when the finger goes up.
    }

    function tMove(e) {
        // Runs on touchmove
        var e = e || window.event;
        e.preventDefault();
        moveElement(e.touches[0].clientX, e.touches[0].clientY);
    }

    function tEnd(e) {
        // Runs on touchend
        pPointerDown = false; 
        window.removeEventListener('touchend', tEnd, false);
        window.removeEventListener('touchmove', tMove, false);
    }

    //********************************************************************
    // SHARED MOUSE AND TOUCH
    //********************************************************************

    function moveElement(clientX, clientY) {
        // Called when the mouse is dragging pElement.
        if (pPointerDown) {
            var elementClientRect = pElement.getBoundingClientRect();
            var elementStyle = window.getComputedStyle(pElement);
            var tX = parseInt(elementStyle.left) - elementClientRect.left;
            var tY = parseInt(elementStyle.top) - elementClientRect.top; 
            // tX and tY translate from client coordinates to pElement CSS.
            // For instance, constraintClientRect.left is the left edge
            // of the constraining rectangle in client coordinates, ie,
            // relative to the top left corner of the viewport. So
            // constraintClientRect.left + tX is the left edge of the
            // constraining rectangle in pElement CSS coordinates.
            //---------------------
            if (pConstraint) {
                var constraintClientRect = pConstraint.getBoundingClientRect();
                if (clientX - pOffsetX  < constraintClientRect.left) {
                    // If we're about to cross the left border, position 
                    // pElement on left edge of constraining rect.
                    pElement.style.left = constraintClientRect.left + tX + 'px';
                }
                else {
                    if (clientX + elementClientRect.width - pOffsetX > constraintClientRect.right) {
                        // If we're about to cross the right border, position on right edge of constraining rect.
                        pElement.style.left = constraintClientRect.right - elementClientRect.width + tX + 'px';
                    }
                    else {
                        if (clientX >= constraintClientRect.left + pOffsetX && clientX <= constraintClientRect.right - (elementClientRect.width - pOffsetX)) {
                            // If we're not crossing either of the two horizontal borders, proceed normally.
                            pElement.style.left = clientX - pOffsetX + tX + 'px';
                        }
                        else {
                            // do nothing
                        }
                    } 
                }
                //---------------------
                if (clientY - pOffsetY < constraintClientRect.top) {
                    pElement.style.top = constraintClientRect.top + tY + 'px';
                }
                else {
                    if (clientY + elementClientRect.height - pOffsetY > constraintClientRect.bottom) {
                        pElement.style.top = constraintClientRect.bottom + tY - elementClientRect.height + 'px';
                    }
                    else {
                        if (clientY >= constraintClientRect.top + pOffsetY && clientY <= constraintClientRect.bottom  - (elementClientRect.height - pOffsetY)) {
                            pElement.style.top = clientY - pOffsetY + tY + 'px';
                        }
                        else {
                            // do nothing
                        }
                    }
                }
                
            }   // end if (pConstraint)
            else {
                // No constraining element, in this case.
                pElement.style.left = clientX + tX - pOffsetX + 'px';
                pElement.style.top = clientY + tY - pOffsetY + 'px';
            }
            
        }
    }

    //***********************************************************************
    // INITIALIZATION
    //***********************************************************************

    pPointerDown = false;
    pConstraint = null;
    if (typeof aElement == "string") {
        pElement = document.getElementById(aElement);
    }
    else {
        pElement = aElement;
    }
    pElement.addEventListener('mousedown', mDown, false);
    pElement.addEventListener('touchstart', tStart, false);
    if (aCage) {
        this.setCage(aCage);
    }
    else {
        pConstraint = null;
    }
}   // end of DragElement