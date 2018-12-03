import React from 'react';
import styled from 'styled-components';
import { Droppable } from 'react-beautiful-dnd';
import Card from './card';
import CardResize from './cardResize';

const CardList = styled.div`
  border: 1px solid lightgrey;
  /*hauteur fixe sur l'axe vertical:*/
  flex: 0 0 50px;

  padding: 8px;
  transition: background-color 0.2s ease;
  background-color: ${props => (props.isDraggingOver ? 'skyblue' : 'white')}
  display: flex;
  flex-direction:row;
  width: 400px;

  background-image: linear-gradient(to right, black 50%, rgba(255,255,255,0) 0%);
  background-position: top;
  background-size: 50px 2px;
  background-repeat: repeat-x;
`;

export default class LineResize extends React.Component {

  resizeOnRight(cardId) {
    return;
  }

  render() {
    return (
          <Droppable droppableId={this.props.line.id} direction="horizontal">
            {(provided, snapshot) => (
              <CardList
                ref={provided.innerRef}
                {...provided.droppableProps}
                isDraggingOver={snapshot.isDraggingOver}
              >
                {this.props.cards.map((card, index) =>
                    <CardResize
                      key={card.id}
                      resizeOnRight={this.resizeOnRight()}
                      card={card}
                      index={index}
                      isLast={(index===this.props.cards.length-1)} />)}

                {provided.placeholder}
              </CardList>
            )}
          </Droppable>
    );
  }
}
