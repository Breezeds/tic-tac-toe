import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// Square 组件渲染了一个单独的 <button>   Square 组件称做“受控组件”
function Square(props) {
    console.log('props.className :>> ', props.className);
    return (
        <button className={`square ${props.className}`} onClick={() => props.onClick()}>
            {props.value}
        </button>
    )
}
  
// Board 组件渲染了 9 个方块
class Board extends React.Component {
    renderSquare(i) {
        const { lines } = this.props;
        const [a, b, c] = lines;

        const isWinner = () => {
            if(a === i || b===i || c===i) {
                return true
            }
            return false;
        }
        
        return (
            <Square 
                className={isWinner() ? 'winnerLine' : ''}
                value={this.props.squares[i]} 
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {
        const rows = 3;
        const cols = 3;
        return (
            <div>
                {
                    Array(rows).fill(null).map((row, rowIndex) => {
                        return (
                            <div className="board-row" key={rowIndex}>
                                {
                                    Array(cols).fill(null).map((col, colIndex) => {
                                        const current = rowIndex * cols + colIndex;
                                        return (
                                            <React.Fragment key={colIndex}> {this.renderSquare(current)} </React.Fragment>
                                        )
                                    })
                                }
                            </div>
                        )
                    })
                }
            </div>
        );
    }                                             
}

// Game 组件渲染了含有默认值的一个棋盘
class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // 历史步骤
            history: [{
                squares: Array(9).fill(null)
            }],
            xIsNext: true,  // 默认第一步是“X”
            stepNumber: 0,  // 当前步数
        }
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1]
        console.log('current :>> ', current);
        // 复制squares副本
        const squares = current.squares.slice() 
        // 当有玩家胜出时，或者某个 Square 已经被填充时，该函数不做任何处理直接返回。
        if(calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            // concat() 方法它并不会改变原数组
            history: history.concat([{
                squares: squares,
                clickButtonIndex: i + 1,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
            currentStep: -1
        })
    }

    // 跳转到指定历史步骤
    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
            currentStep: step
        })
    }

    // 计算行号和列号
    calcRowCol(index) {
        let row = 0,
            col = 0;
        if(index || index === 0) {
            row = Math.ceil(index / 3)
            col = index % 3 === 0 ? 3 : index % 3
        }
        return { row, col }
    }

    // 升序
    handleAscending() {
        this.setState({
            reverse: false
        })
    }

    // 降序
    handleDescending() {
        this.setState({
            reverse: true
        })
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares) ? calculateWinner(current.squares)?.winner : null;
        const lines = calculateWinner(current.squares) ? calculateWinner(current.squares)?.lines : null;
        console.log('lines :>> ', lines);

        const moves = history.map((step, move) => {
            console.log('step :>> ', step);
            const desc = move ? ('go to move 第' + move +'步') : ('go to move start');
            const rowCol = this.calcRowCol(step?.clickButtonIndex)
            const showRowCol = '   落棋点: 行号 '+ rowCol.row + ', 列号 '+rowCol.col
            return (
                <li key={move} style={{backgroundColor: 'transparent'}}>
                    <button 
                        style={{fontWeight: (this.state.currentStep === move) ? 'bolder' : 400}} 
                        onClick={() => this.jumpTo(move)}
                    >
                        {(desc + showRowCol)}
                    </button>
                </li>
            )
        })

        // 反转数组，升序，降序
        if(this.state.reverse) {
            moves.reverse()
        }

        let status;
        if(winner) {
            status = 'Winner: '+ winner
        }else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O')
        }
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        lines={lines || []}
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{ status }</div>
                    <div>
                        <button type="button" onClick={() => this.handleAscending()}>升序</button>
                        <button type="button" onClick={() => this.handleDescending()}>降序</button>
                    </div>
                    <ol>{ moves }</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render( <Game />, document.getElementById('root') );

/**
 * @description 判断胜利者
 * @param { Array } squares ['X','O',null...]  length<=9
 * @returns null X O
 */ 
function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
          const winnerObj = {
              winner: squares[a],
              lines: lines[i]
          }
          return winnerObj
      }
    }
    if(squares.indexOf(null) === -1) {
        alert('平局！')
        return null
    }
    return null;
  }
