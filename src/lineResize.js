import React from 'react';
import styled from 'styled-components';
import CardResize from './cardResize';

var dotProp = require('dot-prop-immutable');

const CardList = styled.div`
  padding-top: 8px;
  transition: background-color 0.2s ease;
  background-color: ${props => (props.isDraggingOver ? 'skyblue' : 'white')}

  /*hauteur fixe sur l'axe vertical:*/
  flex: 0 0 50px;
  display: flex;
  flex-direction:row;
  width: 400px;

  background-image: linear-gradient(to right, black 50%, rgba(255,255,255,0) 0%);
  background-position: top;
  background-size: 50px 2px;
  background-repeat: repeat-x;
`;

class LineResize extends React.Component {

  render() {
    return (
              <CardList>
                {this.props.cards.map((card, index) =>{
                  return(
                    <CardResize
                      key={card.id}
                      card={card}
                      index={index}
                      isLast={(index===this.props.cards.length-1)}
                      add1OnRight={()=>this.props.add1OnRight(index)}
                      rmv1OnRight={()=>this.props.rmv1OnRight(index)}
                    />)}
                  )}
              </CardList>
    );
  }
}
export default LineResize;
