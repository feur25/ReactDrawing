import React, { useContext } from 'react';
import { AppContext } from "./context";

const Tools = () => {
  const { 
    role, 
    brushWidth, 
    changeBrushWidth,
    brushColor,
    changeBrushColor,
    bgColor,
    changeBgColor,
    handleClearCanvas
  } = useContext(AppContext)

  return (
    <div className='tools_main'>
      <div className='users_title'>Tools</div>
      <div className='users_underline' />
      <div className='tools_tools'>
        <div className='tools_color'>
          Brush/ Gomme
          <div className='tools_row'>
            <input className='tools_width_input_range' value={brushWidth} onChange={e => changeBrushWidth(e.target.value)} type="range" min="1" max="100" />
            <div className='tools_width_input_number'>{brushWidth}px</div>
          </div>
          <input className='tools_color_input_1' value={brushColor} onChange={e => changeBrushColor(e.target.value)} type="color" />
        </div>
        {role === "leader" ? 
          <button className='tools_button' onClick={handleClearCanvas}>Tous Supprimer</button>
        :
          <button className='tools_button'>Tous Supprimer</button>
        }
        <div className='tools_color'>
          Couleur de Fond
          <input className='tools_color_input_2' value={bgColor} onChange={e => changeBgColor(e.target.value)} type="color" />
        </div>
      </div>
    </div>
  )
}

export default Tools;