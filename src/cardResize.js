import React from 'react';
import { Resizable } from 'react-resizable';
import './box.css';

class CardResize extends React.Component {

  onResize = (event, {element, size}) => {
    let newWidthOn16 = Math.trunc((size.width+2)/25);
    if (newWidthOn16 > this.props.card.widthOn16) {
      this.props.add1OnRight();
    }
    else if (newWidthOn16 < this.props.card.widthOn16) {
      this.props.rmv1OnRight();
    }
    return;
  };

  render() {
    let width = this.props.card.widthOn16*25-2
    if (!this.props.isLast) return (
      <Resizable
        className='box'
        width={width}
        axis='x'
        onResize={this.onResize}
      >
        <div className='box' style={{flex:'0 0 '+width+'px',backgroundColor:this.props.card.color}}>
          {Math.trunc(100*this.props.card.widthOn16 / 16)}%
        </div>
      </Resizable>
    );
    else return (
      <div className='box' style={{flex:'0 0 '+width+'px',backgroundColor:this.props.card.color}}>
          {Math.trunc(100*this.props.card.widthOn16 / 16)}%
      </div>
    );
  }
}
export default CardResize;
