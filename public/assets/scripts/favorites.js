/* CREDIT: Code here was adapted from Jonathan Ching - https://codepen.io/chingy/pen/Exxvpjo */

(function() {
  "use strict";
  
  const table = document.getElementById('favorites-table');
  const tbody = table.querySelector('tbody');
  
  let currRow = null, // the row being dragged
      originalIndex = null, // the index of the original row
      finalIndex = null, // the index where the original row was inserted
      dragElem = null, // the clone of currRow added to bottom of table
      mouseDownX = 0,
      mouseDownY = 0,         
      mouseX = 0,
      mouseY = 0,      
      mouseDrag = false;  
  
  function init() {
    bindMouse();
  }
  
  function bindMouse() {
    document.addEventListener('mousedown', (event) => {
      if(event.button != 0) return true;
      
      let target = getTargetRow(event.target);

      if(target) {
        currRow = target;
        originalIndex = parseInt(currRow.firstElementChild.innerHTML) - 1;
        addDraggableRow(target);
        currRow.classList.add('is-dragging');

        let coords = getMouseCoords(event);
        mouseDownX = coords.x;
        mouseDownY = coords.y;      
        mouseDrag = true;
      }
    });
    
    document.addEventListener('mousemove', (event) => {
      if(!mouseDrag) return;
      
      let coords = getMouseCoords(event);
      mouseX = coords.x - mouseDownX;
      mouseY = coords.y - mouseDownY;  
      
      moveRow(mouseX, mouseY);
    });
    
    document.addEventListener('mouseup', (event) => {
      if(!mouseDrag) return;

      if (originalIndex != finalIndex) {
        finalizeSwap(originalIndex, finalIndex);        
      }

      currRow.classList.remove('is-dragging');
      table.removeChild(dragElem);
      
      dragElem = null;
      mouseDrag = false;

    });    
  }

  async function finalizeSwap(originalIndex, finalIndex) {

    let data = {};
    data.originalIndex = originalIndex;
    data.finalIndex = finalIndex;

    try {
        let response = await fetch('/favorites/swap', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });
    } catch (err) {
        window.alert("Error swapping rows.");
        console.log(err);
    }
  }
  
  function swapRow(row, index) {
     let currIndex = Array.from(tbody.children).indexOf(currRow),
         newNode = currIndex > index ? currRow : row,
         referenceNode = currIndex > index ? row : currRow;

     finalIndex = index;

     // swap display indices too
     let newNodeIndex = parseInt(newNode.firstElementChild.innerHTML),
     referenceNodeIndex = parseInt(referenceNode.firstElementChild.innerHTML);
     newNode.firstElementChild.innerHTML = referenceNodeIndex;
     referenceNode.firstElementChild.innerHTML = newNodeIndex;

     tbody.insertBefore(newNode, referenceNode);

  }
    
  function moveRow(x, y) {
    dragElem.style.transform = "translate3d(" + x + "px, " + y + "px, 0)";
    
    let dPos = dragElem.getBoundingClientRect(),
        currStartY = dPos.y, currEndY = currStartY + dPos.height,
        rows = getRows();

    for (let i = 0; i < rows.length; i++) {
      let rowElem = rows[i],
          rowSize = rowElem.getBoundingClientRect(),
          rowStartY = rowSize.y, rowEndY = rowStartY + rowSize.height;

      if (currRow !== rowElem && isIntersecting(currStartY, currEndY, rowStartY, rowEndY)) {
        if(Math.abs(currStartY - rowStartY) < rowSize.height / 2) {
          swapRow(rowElem, i);
          // update the index display on dragged row
          dragElem.firstElementChild.innerHTML = i + 1;
        }
      }
    }    
  }
  
  function addDraggableRow(target) {
      dragElem = target.cloneNode(true);
      dragElem.classList.add('draggable-table__drag');
      dragElem.style.height = getStyle(target, 'height');
      dragElem.style.background = getStyle(target, 'backgroundColor');     
      for(let i = 0; i < target.children.length; i++) {
        let oldTD = target.children[i],
            newTD = dragElem.children[i];
        newTD.style.width = getStyle(oldTD, 'width');
        newTD.style.height = getStyle(oldTD, 'height');
        newTD.style.padding = getStyle(oldTD, 'padding');
        newTD.style.margin = getStyle(oldTD, 'margin');
      }      
      
      table.appendChild(dragElem);

    
      let tPos = target.getBoundingClientRect(),
          dPos = dragElem.getBoundingClientRect();
      dragElem.style.bottom = ((dPos.y - tPos.y) - tPos.height) + "px";
      dragElem.style.left = "-1px";    
    
      document.dispatchEvent(new MouseEvent('mousemove',
        { view: window, cancelable: true, bubbles: true }
      ));    
  }  
  
  function getRows() {
    return table.querySelectorAll('tbody tr');
  }    
  
  function getTargetRow(target) {
      let elemName = target.tagName.toLowerCase();

      if(elemName == 'tr') return target;
      if(elemName == 'td') return target.closest('tr');     
  }
  
  function getMouseCoords(event) {
    return {
        x: event.clientX,
        y: event.clientY
    };    
  }  
  
  function getStyle(target, styleName) {
    let compStyle = getComputedStyle(target),
        style = compStyle[styleName];

    return style ? style : null;
  }  
  
  function isIntersecting(min0, max0, min1, max1) {
      return Math.max(min0, max0) >= Math.min(min1, max1) &&
             Math.min(min0, max0) <= Math.max(min1, max1);
  }  
  
  
  
  init();
  
})();