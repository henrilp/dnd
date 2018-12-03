import React from 'react';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';
import { Resizable } from 'react-resizable';
import './box.css';

export default class Card extends React.Component {

  constructor(props){
    super(props)
    //reçoit key, index, card, isLast, resizeOnRight()
  }

  componentWillMount() {
    this.setState({widthOn16:this.props.card.widthOn16})
  }

  render() {
    let width = this.state.widthOn16*25-2
    return (
      <Resizable
        className='box'
        width={width}
        axis='x'
        onResize={this.props.resizeOnRight}
      >
        <div className='box' style={{flex:'0 0 '+width+'px'}}>
          carte numéro {this.props.card.content}<br/>
          de largeur {this.state.widthOn16}
        </div>
      </Resizable>
    );
  }
}
