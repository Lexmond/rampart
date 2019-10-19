/*
 * Copyright (c) 2019 ARTIC Network http://artic.network
 * https://github.com/artic-network/rampart
 *                            
 * This file is part of RAMPART. RAMPART is free software: you can redistribute it and/or modify it under the terms of the 
 * GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your 
 * option) any later version. RAMPART is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; 
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  
 *
 * See the GNU General Public License for more details. You should have received a copy of the GNU General Public License 
 * along with RAMPART. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import React from 'react';
import ReactDOM from 'react-dom';


const Modal = ({children, dismissModal, className}) => {
  return (
    ReactDOM.createPortal(
      (
        <div className="modal-background clickable" onClick={dismissModal}>
          <div className="centerVertically">
            <div className="centerHorizontally">
              <div className={`modal-foreground not-clickable ${className}`} onClick={(e) => e.stopPropagation()}>
                {children}
                <button className="modernButton close-modal" onClick={dismissModal}>close</button>
              </div>
            </div>
          </div>
        </div>
      ),
      document.querySelector(`#modalPortal`)
    )
  )
};

export default Modal;
