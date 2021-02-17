import React from 'react';
import axios from 'axios';
import Modal from './Modal';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      board: [],
      black: 12,
      red: 12,
      selected: [],
      turn: 'black',
      autoJumpRed: false,
      autoJumpBlack: false,
      modal: true,
      victory: '',
      gameList: [],
      playerOne: 'Player One',
      playerTwo: 'Player Two',
    };
    this.makeBoard = this.makeBoard.bind(this);
    this.saveGame = this.saveGame.bind(this);
    this.changeGame = this.changeGame.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.changeVictory = this.changeVictory.bind(this);
    this.players = this.players.bind(this);
    this.moveSelected = this.moveSelected.bind(this);
    this.resetRed = this.resetRed.bind(this);
    this.resetRedJump = this.resetRedJump.bind(this);
    this.selectRed = this.selectRed.bind(this);
    this.resetBlack = this.resetBlack.bind(this);
    this.resetBlackJump = this.resetBlackJump.bind(this);
    this.selectBlack = this.selectBlack.bind(this);
  }

  componentDidMount() {
    this.makeBoard('newBoard');
  }

  makeBoard(name) {
    axios.get(`/api/boards/${name}`)
      .then((data) => {
        this.setState({ name: data.data.name, board: data.data.board, black: data.data.black, red: data.data.red, turn: data.data.turn, autoJumpRed: data.data.autoJumpRed, autoJumpBlack: data.data.autoJumpBlack, playerOne: data.data.playerOne, playerTwo: data.data.playerTwo, victory: '' });
      })
    axios.get('/api/games')
      .then((data) => {
        this.setState({ gameList: data.data[0].games });
      })
  }

  saveGame() {
    const { playerOne, playerTwo, board, black, red, turn, autoJumpRed, autoJumpBlack, gameList } = this.state;
    axios.post('/api/games', {
      board: {
        name: `${playerOne} v ${playerTwo}`,
        board: board,
        black: black,
        red: red,
        turn: turn,
        autoJumpRed: autoJumpRed,
        autoJumpBlack: autoJumpBlack,
        playerOne: playerOne,
        playerTwo: playerTwo,
      },
      games: gameList,
    })
  }

  changeGame() {
    this.toggleModal();
    this.makeBoard('newBoard');
  }

  toggleModal() {
    const { modal } = this.state;
    this.setState({ modal: !modal });
  }

  changeVictory() {
    this.setState({ victory: '' });
  }

  players(one, two) {
    this.setState({ playerOne: one, playerTwo: two });
  }

  moveSelected(event) {
    const target = event.target.getAttribute('name');
    const { board, selected, turn, autoJumpBlack, autoJumpRed, black, red, playerOne, playerTwo } = this.state;
    const rows = Number(target.charAt(0));
    const columns = Number(target.charAt(1));
    const to = board[rows][columns];
    const from = board[selected[0]][selected[1]];
    board[rows][columns] = from;
    board[selected[0]][selected[1]] = to;
    board[rows][columns][1] = 'redSquare';
    board[selected[0]][selected[1]][2] = '';
    if (turn === 'black') {
      if (rows === 0) {
        board[rows][columns][0] = 'O';
      }
      if (autoJumpBlack) {
        const rowToDelete = (rows + selected[0]) / 2;
        const columnToDelete = (columns + selected[1]) / 2;
        board[rowToDelete][columnToDelete] = [null, 'redSquare', ''];
        if (red === 1) {
          this.setState({ modal: true, victory: playerOne })
        } else {
          this.setState( prevState => ({ red: prevState.red - 1 }));
          this.resetBlackJump();
        }
      } else {
        this.resetBlack();
      }
      this.setState({ turn: 'red', autoJumpBlack: false });
      for (let row = 0; row < board.length; row ++) {
        for (let column = 0; column < board[row].length; column++) {
          if (board[row][column][0] === 'x' || board[row][column][0] === 'X') {
            if (board[row][column][0] === 'X') {
              if ((row > 0 && column > 0 && board[row - 1][column - 1][0] === 'o' && board[row - 2][column - 2][0] === null)
                || (row > 0 && column > 0 && board[row - 1][column - 1][0] === 'O' && board[row - 2][column - 2][0] === null)
                || (row > 0 && column < 7 && board[row - 1][column + 1][0] === 'o' && board[row - 2][column + 2][0] === null)
                || (row > 0 && column < 7 && board[row - 1][column + 1][0] === 'O' && board[row - 2][column + 2][0] === null)) {
                  this.setState({ autoJumpRed: true });
                break;
              }
            }
            if ((row < 7 && column > 0 && board[row + 1][column - 1][0] === 'o' && board[row + 2][column - 2][0] === null)
              || (row < 7 && column > 0 && board[row + 1][column - 1][0] === 'O' && board[row + 2][column - 2][0] === null)
              || (row < 7 && column < 7 && board[row + 1][column + 1][0] === 'o' && board[row + 2][column + 2][0] === null)
              || (row < 7 && column < 7 && board[row + 1][column + 1][0] === 'O' && board[row + 2][column + 2][0] === null)) {
                this.setState({ autoJumpRed: true });
              break;
            }
          }
        }
      }
    } else {
      if (rows === 7) {
        board[rows][columns][0] = 'X';
      }
      if (autoJumpRed) {
        const rowToDelete = (rows + selected[0]) / 2;
        const columnToDelete = (columns + selected[1]) / 2;
        board[rowToDelete][columnToDelete] = [null, 'redSquare', ''];
        if (black === 1) {
          this.setState({ modal: true, victory: playerTwo })
        } else {
          this.setState( prevState => ({ black: prevState.black - 1 }));
          this.resetRedJump();
        }
      } else {
        this.resetRed();
      }
      this.setState({ turn: 'black', autoJumpRed: false });
      for (let row = 0; row < board.length; row ++) {
        for (let column = 0; column < board[row].length; column++) {
          if (board[row][column][0] === 'o' || board[row][column][0] === 'O') {
            if (board[row][column][0] === 'O') {
              if ((row < 7 && column > 0 && board[row + 1][column - 1][0] === 'X' && board[row + 2][column - 2][0] === null)
              || (row < 7 && column < 7 && board[row + 1][column + 1][0] === 'X' && board[row + 2][column + 2][0] === null)
              || (row < 7 && column > 0 && board[row + 1][column - 1][0] === 'x' && board[row + 2][column - 2][0] === null)
              || (row < 7 && column < 7 && board[row + 1][column + 1][0] === 'x' && board[row + 2][column + 2][0] === null)) {
                this.setState({ autoJumpBlack: true });
                break;
              }
            }
            if ((row > 0 && column > 0 && board[row - 1][column - 1][0] === 'X' && board[row - 2][column - 2][0] === null)
              || (row > 0 && column < 7 && board[row - 1][column + 1][0] === 'X' && board[row - 2][column + 2][0] === null)
              || (row > 0 && column > 0 && board[row - 1][column - 1][0] === 'x' && board[row - 2][column - 2][0] === null)
              || (row > 0 && column < 7 && board[row - 1][column + 1][0] === 'x' && board[row - 2][column + 2][0] === null)) {
                this.setState({ autoJumpBlack: true });
              break;
            }
          }
        }
      }
    }
  }

  resetRed() {
    const { board, selected } = this.state;
    board[selected[0]][selected[1]][1] = 'redSquare';
    if (selected[0] > 0 && selected[1] > 0 && board[selected[0] - 1][selected[1] - 1] !== undefined  && board[selected[0] - 1][selected[1] - 1][0] === null) {
      board[selected[0] - 1][selected[1] - 1][1] = 'redSquare';
      board[selected[0] - 1][selected[1] - 1][2] = '';
    }
    if (selected[0] > 0 && selected[1] < 7 && board[selected[0] - 1][selected[1] + 1] !== undefined  && board[selected[0] - 1][selected[1] + 1][0] === null) {
      board[selected[0] - 1][selected[1] + 1][1] = 'redSquare';
      board[selected[0] - 1][selected[1] + 1][2] = '';
    }
    if (selected[0] < 7 && selected[1] > 0 && board[selected[0] + 1][selected[1] - 1] !== undefined  && board[selected[0] + 1][selected[1] - 1][0] === null) {
      board[selected[0] + 1][selected[1] - 1][1] = 'redSquare';
      board[selected[0] + 1][selected[1] - 1][2] = '';
    }
    if (selected[0] < 7 && selected[1] < 7 && board[selected[0] + 1][selected[1] + 1] !== undefined  && board[selected[0] + 1][selected[1] + 1][0] === null) {
      board[selected[0] + 1][selected[1] + 1][1] = 'redSquare';
      board[selected[0] + 1][selected[1] + 1][2] = '';
    }
    this.setState({ selected: [] })
  }

  resetRedJump() {
    const { board, selected } = this.state;
    board[selected[0]][selected[1]][1] = 'redSquare';
    if (selected[0] > 1 && selected[1] > 1 && board[selected[0] - 2][selected[1] - 2] !== undefined  && board[selected[0] - 2][selected[1] - 2][0] === null) {
      board[selected[0] - 2][selected[1] - 2][1] = 'redSquare';
      board[selected[0] - 2][selected[1] - 2][2] = '';
    }
    if (selected[0] > 1 && selected[1] < 6 && board[selected[0] - 2][selected[1] + 2] !== undefined  && board[selected[0] - 2][selected[1] + 2][0] === null) {
      board[selected[0] - 2][selected[1] + 2][1] = 'redSquare';
      board[selected[0] - 2][selected[1] + 2][2] = '';
    }
    if (selected[0] < 6 && selected[1] > 1 && board[selected[0] + 2][selected[1] - 2] !== undefined  && board[selected[0] + 2][selected[1] - 2][0] === null) {
      board[selected[0] + 2][selected[1] - 2][1] = 'redSquare';
      board[selected[0] + 2][selected[1] - 2][2] = '';
    }
    if (selected[0] < 6 && selected[1] < 6 && board[selected[0] + 2][selected[1] + 2] !== undefined  && board[selected[0] + 2][selected[1] + 2][0] === null) {
      board[selected[0] + 2][selected[1] + 2][1] = 'redSquare';
      board[selected[0] + 2][selected[1] + 2][2] = '';
    }
    this.setState({ selected: [] })
  }

  selectRed(event) {
    const { board, selected, turn, autoJumpRed } = this.state;
    if (turn === 'red') {
      const target = event.target.getAttribute('name');
      const columns = Number(target.charAt(1));
      const rows = Number(target.charAt(0));
      if (autoJumpRed) {
        if (selected.length > 0) {
          this.resetRedJump();
        } else {
          board[rows][columns][1] = 'selectedPiece';
          if (rows > 1 && columns > 1 && board[rows - 2][columns - 2] !== undefined && board[rows - 2][columns - 2][0] === null && board[rows][columns][0] === 'X' && (board[rows - 1][columns - 1][0] === 'o' || board[rows - 1][columns - 1][0] === 'O')) {
            board[rows - 2][columns - 2][1] = 'selectedSquare';
            board[rows - 2][columns - 2][2] = 'moveSelected';
          }
          if (rows > 1 && columns < 6 && board[rows - 2][columns + 2] !== undefined && board[rows - 2][columns + 2][0] === null && board[rows][columns][0] === 'X' && (board[rows - 1][columns + 1][0] === 'o' || board[rows - 1][columns + 1][0] === 'O')) {
            board[rows - 2][columns + 2][1] = 'selectedSquare';
            board[rows - 2][columns + 2][2] = 'moveSelected';
          }
          if (rows < 6 && columns > 1 && board[rows + 2][columns - 2] !== undefined && board[rows + 2][columns - 2][0] === null && (board[rows + 1][columns - 1][0] === 'o' || board[rows + 1][columns - 1][0] === 'O')) {
            board[rows + 2][columns - 2][1] = 'selectedSquare';
            board[rows + 2][columns - 2][2] = 'moveSelected';
          }
          if (rows < 6 && columns < 6 && board[rows + 2][columns + 2] !== undefined && board[rows + 2][columns + 2][0] === null && (board[rows + 1][columns + 1][0] === 'o' || board[rows + 1][columns + 1][0] === 'O')) {
            board[rows + 2][columns + 2][1] = 'selectedSquare';
            board[rows + 2][columns + 2][2] = 'moveSelected';
          }
          this.setState({ selected: [rows, columns] })
        }
      } else {
        if (selected.length > 0) {
          this.resetRed();
        } else {
          board[rows][columns][1] = 'selectedPiece';
          if (rows > 0 && columns > 0 && board[rows - 1][columns - 1] !== undefined && board[rows - 1][columns - 1][0] === null  && board[rows][columns][0] === 'X') {
            board[rows - 1][columns - 1][1] = 'selectedSquare';
            board[rows - 1][columns - 1][2] = 'moveSelected';
          }
          if (rows > 0 && columns < 7 && board[rows - 1][columns + 1] !== undefined && board[rows - 1][columns + 1][0] === null  && board[rows][columns][0] === 'X') {
            board[rows - 1][columns + 1][1] = 'selectedSquare';
            board[rows - 1][columns + 1][2] = 'moveSelected';
          }
          if (rows < 7 && columns > 0 && board[rows + 1][columns - 1] !== undefined && board[rows + 1][columns - 1][0] === null) {
            board[rows + 1][columns - 1][1] = 'selectedSquare';
            board[rows + 1][columns - 1][2] = 'moveSelected';
          }
          if (rows < 7 && columns < 7 && board[rows + 1][columns + 1] !== undefined && board[rows + 1][columns + 1][0] === null) {
            board[rows + 1][columns + 1][1] = 'selectedSquare';
            board[rows + 1][columns + 1][2] = 'moveSelected';
          }
          this.setState({ selected: [rows, columns] })
        }
      }
    }
  }

  resetBlack() {
    const { board, selected } = this.state;
    board[selected[0]][selected[1]][1] = 'redSquare';
    if (selected[0] > 0 && selected[1] > 0 && board[selected[0] - 1][selected[1] - 1] !== undefined  && board[selected[0] - 1][selected[1] - 1][0] === null) {
      board[selected[0] - 1][selected[1] - 1][1] = 'redSquare';
      board[selected[0] - 1][selected[1] - 1][2] = '';
    }
    if (selected[0] > 0 && selected[1] < 7 && board[selected[0] - 1][selected[1] + 1] !== undefined  && board[selected[0] - 1][selected[1] + 1][0] === null) {
      board[selected[0] - 1][selected[1] + 1][1] = 'redSquare';
      board[selected[0] - 1][selected[1] + 1][2] = '';
    }
    if (selected[0] < 7 && selected[1] > 0 && board[selected[0] + 1][selected[1] - 1] !== undefined  && board[selected[0] + 1][selected[1] - 1][0] === null) {
      board[selected[0] + 1][selected[1] - 1][1] = 'redSquare';
      board[selected[0] + 1][selected[1] - 1][2] = '';
    }
    if (selected[0] < 7 && selected[1] < 7 && board[selected[0] + 1][selected[1] + 1] !== undefined  && board[selected[0] + 1][selected[1] + 1][0] === null) {
      board[selected[0] + 1][selected[1] + 1][1] = 'redSquare';
      board[selected[0] + 1][selected[1] + 1][2] = '';
    }
    this.setState({ selected: [] })
  }

  resetBlackJump() {
    const { board, selected } = this.state;
    board[selected[0]][selected[1]][1] = 'redSquare';
    if (selected[0] > 1 && selected[1] > 1 && board[selected[0] - 2][selected[1] - 2] !== undefined  && board[selected[0] - 2][selected[1] - 2][0] === null) {
      board[selected[0] - 2][selected[1] - 2][1] = 'redSquare';
      board[selected[0] - 2][selected[1] - 2][2] = '';
    }
    if (selected[0] > 1 && selected[1] < 6 && board[selected[0] - 2][selected[1] + 2] !== undefined  && board[selected[0] - 2][selected[1] + 2][0] === null) {
      board[selected[0] - 2][selected[1] + 2][1] = 'redSquare';
      board[selected[0] - 2][selected[1] + 2][2] = '';
    }
    if (selected[0] < 6 && selected[1] > 1 && board[selected[0] + 2][selected[1] - 2] !== undefined  && board[selected[0] + 2][selected[1] - 2][0] === null) {
      board[selected[0] + 2][selected[1] - 2][1] = 'redSquare';
      board[selected[0] + 2][selected[1] - 2][2] = '';
    }
    if (selected[0] < 6 && selected[1] < 6 && board[selected[0] + 2][selected[1] + 2] !== undefined  && board[selected[0] + 2][selected[1] + 2][0] === null) {
      board[selected[0] + 2][selected[1] + 2][1] = 'redSquare';
      board[selected[0] + 2][selected[1] + 2][2] = '';
    }
    this.setState({ selected: [] })
  }

  selectBlack(event) {
    const { board, selected, turn, autoJumpBlack } = this.state;
    if (turn === 'black') {
      const target = event.target.getAttribute('name');
      const columns = Number(target.charAt(1));
      const rows = Number(target.charAt(0));
      if (autoJumpBlack) {
        if (selected.length > 0) {
          this.resetBlackJump();
        } else {
          board[rows][columns][1] = 'selectedPiece';
          if (rows > 1 && columns > 1 && board[rows - 2][columns - 2] !== undefined && board[rows - 2][columns - 2][0] === null && (board[rows - 1][columns - 1][0] === 'x' || board[rows - 1][columns - 1][0] === 'X')) {
            board[rows - 2][columns - 2][1] = 'selectedSquare';
            board[rows - 2][columns - 2][2] = 'moveSelected';
          }
          if (rows > 1 && columns < 6 && board[rows - 2][columns + 2] !== undefined && board[rows - 2][columns + 2][0] === null && (board[rows - 1][columns + 1][0] === 'x' || board[rows - 1][columns + 1][0] === 'X')) {
            board[rows - 2][columns + 2][1] = 'selectedSquare';
            board[rows - 2][columns + 2][2] = 'moveSelected';
          }
          if (rows < 6 && columns > 1 && board[rows + 2][columns - 2] !== undefined && board[rows + 2][columns - 2][0] === null && board[rows][columns][0] === 'O' && (board[rows + 1][columns - 1][0] === 'x' || board[rows + 1][columns - 1][0] === 'X')) {
            board[rows + 2][columns - 2][1] = 'selectedSquare';
            board[rows + 2][columns - 2][2] = 'moveSelected';
          }
          if (rows < 6 && columns < 6 && board[rows + 2][columns + 2] !== undefined && board[rows + 2][columns + 2][0] === null && board[rows][columns][0] === 'O' && (board[rows + 1][columns + 1][0] === 'x' || board[rows + 1][columns + 1][0] === 'X')) {
            board[rows + 2][columns + 2][1] = 'selectedSquare';
            board[rows + 2][columns + 2][2] = 'moveSelected';
          }
          this.setState({ selected: [rows, columns] })
        }
      } else {
        if (selected.length > 0) {
          this.resetBlack();
        } else {
          board[rows][columns][1] = 'selectedPiece';
          if (rows > 0 && columns > 0 && board[rows - 1][columns - 1] !== undefined && board[rows - 1][columns - 1][0] === null) {
            board[rows - 1][columns - 1][1] = 'selectedSquare';
            board[rows - 1][columns - 1][2] = 'moveSelected';
          }
          if (rows > 0 && columns < 7 && board[rows - 1][columns + 1] !== undefined && board[rows - 1][columns + 1][0] === null) {
            board[rows - 1][columns + 1][1] = 'selectedSquare';
            board[rows - 1][columns + 1][2] = 'moveSelected';
          }
          if (rows < 7 && columns > 0 && board[rows + 1][columns - 1] !== undefined && board[rows + 1][columns - 1][0] === null && board[rows][columns][0] === 'O') {
            board[rows + 1][columns - 1][1] = 'selectedSquare';
            board[rows + 1][columns - 1][2] = 'moveSelected';
          }
          if (rows < 7 && columns < 7 && board[rows + 1][columns + 1] !== undefined && board[rows + 1][columns + 1][0] === null && board[rows][columns][0] === 'O') {
            board[rows + 1][columns + 1][1] = 'selectedSquare';
            board[rows + 1][columns + 1][2] = 'moveSelected';
          }
          this.setState({ selected: [rows, columns] })
        }
      }
    }
  }

  render() {
    const { board, turn, modal, gameList, playerOne, playerTwo, victory } = this.state;
    const playersTurn = () => {
      if (turn === 'black') {
        return playerOne;
      } else {
        return playerTwo;
      }
    }
    const whichPiece = (square, index, i) => {
      if (square[0] === null) {
        return null;
      } else if (square[0] === 'x') {
        return (
          <img name={`${index}${i}`} className="piece" src="https://cdn0.iconfinder.com/data/icons/board-games/48/Paul-14-512.png" />
        )
      } else if (square[0] === 'X') {
        return (
          <img name={`${index}${i}`} className="king" src="https://cdn0.iconfinder.com/data/icons/board-games/48/Paul-14-512.png" />
        )
      } else if (square[0] === 'O') {
        return (
          <img name={`${index}${i}`} className="king" src="https://cdn4.iconfinder.com/data/icons/board-games-glyph/48/Games_BoardGames_Artboard_14-512.png" />
        )
      }
      return (
        <img name={`${index}${i}`} className="piece" src="https://cdn4.iconfinder.com/data/icons/board-games-glyph/48/Games_BoardGames_Artboard_14-512.png" />
      )
    }
    return (
      <div>
        <div className="head"><h5>Your turn {playersTurn()}!</h5></div>
        <div className="buttonContainer">
          <button className="save" onClick={this.saveGame}>Save Game</button>
          <button className="save" onClick={this.changeGame}>Change Game</button>
        </div>
        <div>{board.map((row, index) => (
          <div className="grid" key={row[index] + index}>
          {row.map((square, i) => (
            <div onClick={square[2] === 'selectRed' ? this.selectRed : square[2] === 'selectBlack' ? this.selectBlack : square[2] === 'moveSelected' ? this.moveSelected : null} name={`${index}${i}`} className={square[1]} key={square + i}>{whichPiece(square, index, i)}</div>
          ))}
        </div>
        ))}</div>

        <Modal makeBoard={this.makeBoard} modal={modal} victory={victory} changeVictory={this.changeVictory} onClose={this.toggleModal} players={this.players} gameList={gameList} />

      </div>
    );
  }
}
export default App;
