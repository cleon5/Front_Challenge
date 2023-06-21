import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [Images, setImages] = useState([])

  useEffect(() => {
    getImages()
  
  }, [])
  
  const getImages = async() => {
    const response = await fetch("https://jsonplaceholder.typicode.com/photos");
    const jsonData = await response.json();
    setImages(jsonData)
  }
  const addMoveable = () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];
    
    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true
      },
    ]);
  };
  const Delete = (id) =>{
    
       
    let newMoeableComponets = moveableComponents.filter( comp =>
      comp.id != id
  )
  let indexDelete = moveableComponents.findIndex( comp =>
    comp.id == id
)
  Images.splice(indexDelete ,1)
  setMoveableComponents(newMoeableComponets)
  setSelected(null)
  }
  const updateMoveable = (id, newComponent, updateEnd = false) => {

    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
      let lft = moveable.left > 300 ? 300 : moveable.left
      let comp = {
        color:newComponent.color,
          height:newComponent.height,
          left:lft,
          top:newComponent.top,
          width:newComponent.width
      }
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  return (//main componet
    <main style={{ height : "100vh", width: "100vw" }}>
      <button onClick={addMoveable}>Add Moveable1</button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
            backgroundImage={Images && Images[index]?.thumbnailUrl }
            Delete={Delete}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  backgroundImage,
  setSelected,
  isSelected = false,
  updateEnd,
  Delete
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    backgroundImage,
    id,
    
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();
  
  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];
     console.log(translateX, translateY)
    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  const onResizeEnd = async (e) => {
    //Metodo que se llama cuando se termina el rezice
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;
    
    const positionMaxTop = top + (newHeight);
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;

    const absoluteTop = top
    const absoluteLeft = left 

    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        color,
      },
      true
    );
  };
  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          background: color,
        }}
        onClick={() => setSelected(id)}
      >
        <img
          src={backgroundImage}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <button onClick={() =>Delete(id)}>sad</button>
        </div>
      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          let ejex = parentBounds.width  - e.width 
          let x  = e.left > ejex ? ejex : e.left;
          let positionX = x > parentBounds.left  ? x : 0

          console.log( parentBounds.height,  parentBounds.top  ,e.height, (e.clientY))
          let ejeY = parentBounds.height  - (e.height) 
          //console.log(ejeY)
          let y  = e.top > ejeY ? ejeY : e.top;
          let positionY = y > parentBounds.top  ? y :0

          updateMoveable(id, {
            top: positionY,
            left: positionX,
            width,
            height,
            color,
          });
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
