import React from 'react';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';
import './dnd.css'

const ContainerCard = styled.div`
  border: 1px solid grey;
  border-radius: 2px;
  background-color: ${props => (props.isDragging ? 'lightgreen' : props.color)};
  /*width fixed*/
  flex: 0 0 ${props => props.widthOn16*25-2+'px'};
  text-align: center;
  line-height: 50px;
  transition: flex-basis 500ms ease-in-out;
`;

class Card extends React.Component {

  render() {
    return (
        <Draggable draggableId={this.props.card.id} index={this.props.index}>
          {(provided, snapshot) => (
            <ContainerCard
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              ref={provided.innerRef}
              isDragging={snapshot.isDragging}
              widthOn16={this.props.card.widthOn16}
              color={this.props.card.color}
            >
              {Math.trunc(100*this.props.card.widthOn16 / 16)}%
            </ContainerCard>
          )}
        </Draggable>
    );
  }
}
export default Card;
