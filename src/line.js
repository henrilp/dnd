import React from 'react';
import styled from 'styled-components';
import Card from './card';
import { Droppable } from 'react-beautiful-dnd';

const CardList = styled.div`
  /*hauteur fixe sur l'axe vertical:*/
  flex: 0 0 50px;

  padding-top: 8px;
  transition: background-color 0.2s ease;
  background-color: ${props => (props.isDraggingOver ? 'skyblue' : 'white')}
  display: flex;
  flex-direction:row;
  width: 400px;
`;

class Line extends React.Component {

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
                <Card
                  key={card.id}
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
export default Line;
