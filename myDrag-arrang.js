/**
 * 
 * @param {*} elem 父容器
 */
function dragArrange(elem) {
    let elemChild=elem.children;
    let originalClientX, //存储当前点击元素，元素X轴坐标
        originalClientY, //存储当前点击元素，元素Y轴坐标
        dragging = false,
        touchDown = false, //提示已经点击过了---暂时可以不用  
        dragElement, //储存当前选中元素
        $clone, DRAG_THRESHOLD = 5,
        leftOffset, topOffset,
        counter=0;
    var dragEvents = { START: 'mousedown', MOVE: 'mousemove', END: 'mouseup' }


    for (let i = 0; i < elemChild.length; i++) {
        let div = elemChild[i];
        div.classList.add(getEventNamespace())
        function dragStartHandler(e) {
            e.stopPropagation(); //阻止默认行为
            touchDown = true; //提示已经点击过了---暂时可以不用  
            originalClientX = e.clientX; //存储当前点击元素，元素X轴坐标
            originalClientY = e.clientY; //存储当前点击元素，元素Y轴坐标
            dragElement = div; //储存当前选中元素
        }
        div.addEventListener(dragEvents.START, dragStartHandler);
    }



    document.addEventListener(dragEvents.MOVE, dragMoveHandler) //这句是点击拖动事件
    document.addEventListener(dragEvents.END, dragEndHandler); //这句是拖动后，鼠标松开事件

    function dragMoveHandler(e) {
        //判断是否点击了 子元素
        if (!touchDown) return;
        // dragElement;//当前选中元素
        var dragDistanceX = (e.clientX) - originalClientX; //当前距离，减去之前的元素X轴距离
        var dragDistanceY = (e.clientY) - originalClientY; //当前距离，减去之前的元素Y轴距离
        if (dragging) {
            e.stopPropagation(); //取消默认行为
            $clone.style.left = leftOffset + dragDistanceX + 'px';
            $clone.style.top = topOffset + dragDistanceY + 'px';
            shiftHoveredElement($clone, dragElement, elemChild)

        } else if (Math.abs(dragDistanceX) > DRAG_THRESHOLD
            || Math.abs(dragDistanceY) > DRAG_THRESHOLD) {
            $clone = clone(dragElement);//调用克隆方法
            var dragStyle = getCss(dragElement);
            leftOffset = dragElement.offsetLeft - parseInt(dragStyle.marginLeft) - parseInt(dragStyle.paddingLeft);
            topOffset = dragElement.offsetTop - parseInt(dragStyle.marginTop) - parseInt(dragStyle.paddingTop);

            $clone.style.left = leftOffset + 'px';
            $clone.style.top = topOffset + 'px';
            dragElement.parentNode.appendChild($clone)
            dragElement.style.visibility = "hidden"
            dragging = true;
        }
    }

    function dragEndHandler(e) {
        if (dragging) {
            // remove the cloned dragged element and
            // show original element back
            e.stopPropagation();
            dragging = false;
            $clone.remove();
            dragElement.style.visibility = 'visible';

            // $(dragElement).parentNode.trigger(dragEndEvent, elemChild);
        }
        //重新修改状态
        touchDown = false;
    }


    function shiftHoveredElement(clone, dragElement, movableElements) {
        var hoveredElement = getHoveredElement(clone, dragElement, movableElements);
        if (hoveredElement.textContent != dragElement.textContent ||(hoveredElement.className != dragElement.className)) {
            var hoveredElementIndex = index(movableElements, hoveredElement);
            var dragElementIndex = index(movableElements, dragElement);
            if (hoveredElementIndex < dragElementIndex) {
                abter([hoveredElement],[dragElement],'before')
            } else {
                abter([hoveredElement], [dragElement], "after")
   
            }
            //jQuery中 ID查找就不需要了
            // since elements order have changed, need to change order in jQuery Object too 
            // shiftElementPosition(movableElements, dragElementIndex, hoveredElementIndex);
        }
    }

    function getHoveredElement(clone, dragElement, movableElements) {
        var cloneOffset = clone.offset;
        var cloneWidth = clone.offsetWidth;
        var cloneHeight = clone.offsetHeight;
        var cloneLeftPosition = clone.offsetLeft;
        var cloneRightPosition = cloneLeftPosition + cloneWidth;
        var cloneTopPosition = clone.offsetTop;
        var cloneBottomPosition = cloneTopPosition + cloneHeight;
        // 
        // 
        var $currentElement;
        var horizontalMidPosition, verticalMidPosition;
        var offset, overlappingX, overlappingY, inRange;
        // 
        for (var i = 0; i < movableElements.length; i++) {
            $currentElement = movableElements[i];

            if ($currentElement === dragElement) { continue; }

            offset = $currentElement;
            // current element width and draggable element(clone) width or height can be different
            horizontalMidPosition = offset.offsetLeft + 0.5 * $currentElement.offsetWidth;
            verticalMidPosition = offset.offsetTop + 0.5 * $currentElement.offsetHeight;

            // check if this element position is overlapping with dragged element
            overlappingX = (horizontalMidPosition < cloneRightPosition) &&
                (horizontalMidPosition > cloneLeftPosition);

            overlappingY = (verticalMidPosition < cloneBottomPosition) &&
                (verticalMidPosition > cloneTopPosition);

            inRange = overlappingX && overlappingY;

            if (inRange) {
                return $currentElement;
            }
        }
    }

    function clone($element) {
        var $clone = $element.cloneNode(true);
        $clone.style.position = "absolute";
        $clone.style.width = $element.offsetWidth + 'px';
        $clone.style.heiht = $element.offsetHeiht + 'px';
        $clone.style.zIndex = "100000";
        return $clone;
    }
    function getEventNamespace() {
        counter += 1;
        return 'drag-arrange-' + counter;
    }
    function getCss(elem) {
        return window.getComputedStyle(elem);
    }
    function index(elem, name) {
        if (!elem) return;
        let result = 0;
        for (let i = 0; i < elem.length; i++) {
            if (elem[i] === name) result = i;
        }
        return result;
    }
    function abter(elem, selector, typeName) {
        var target = selector,
            result = [];
            Array.prototype.forEach.call(target, function (value, index) {
                Array.prototype.forEach.call(elem, function (v, i) {
                        if (index === 0) {
                            v[typeName](value)
                            result.push(value);
                        } else {
                            var elem = value.cloneNode(true);
                            v[typeName](elem);
                            result.push(elem);
                        }
                })
            })
        return result;
    }
}