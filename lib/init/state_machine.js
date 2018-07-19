'use strict'

const logQueue = require('./log-queue')

var questions
var currentQuestion
var answers
var currentOptions
var currentOptionsPointer
var currentQuestionId
var done

class StateMachine {
  constructor (rli, colors) {
    this.rli = rli
    this.colors = colors
  }

  showPrompt () {
    this.rli.write(this.colors.ANSWER)
    this.rli.prompt()
  }

  onKeypress (key) {
    if (!currentOptions || !key) {
      return
    }

    if (key.name === 'tab' || key.name === 'right' || key.name === 'down') {
      this.suggestOption(currentOptionsPointer + 1)
    } else if (key.name === 'left' || key.name === 'up') {
      this.suggestOption(currentOptionsPointer - 1)
    }

    if (!key.ctrl && !key.meta && key.name !== 'enter' && key.name !== 'return') {
      key.name = 'escape'
    }
  }

  suggestOption (index) {
    if (!currentOptions) {
      return
    }

    if (index === -1) {
      currentOptionsPointer = currentOptions.length - 1
    } else if (index === currentOptions.length) {
      currentOptionsPointer = 0
    } else {
      currentOptionsPointer = index
    }

    this.rli._deleteLineLeft()
    this.rli._deleteLineRight()
    this.rli.write(currentOptions[currentOptionsPointer])
  }

  kill () {
    currentOptions = null
    currentQuestionId = null
    this.rli.write('\n' + this.colors.RESET + '\n')
    this.rli.close()
  }

  onLine (line) {
    if (currentQuestionId) {
      this.rli.write(this.colors.RESET)
      line = line.trim().replace(this.colors.ANSWER, '').replace(this.colors.RESET, '')

      if (currentOptions) {
        currentOptionsPointer = currentOptions.indexOf(line)
        if (currentOptionsPointer === -1) {
          return
        }
      }

      if (line === '') {
        line = null
      }

      if (currentQuestion.boolean) {
        line = (line === 'yes' || line === 'true' || line === 'on')
      }

      if (line !== null && currentQuestion.validate) {
        currentQuestion.validate(line)
      }

      if (currentQuestion.multiple) {
        answers[currentQuestionId] = answers[currentQuestionId] || []
        if (line !== null) {
          answers[currentQuestionId].push(line)
          this.showPrompt()

          if (currentOptions) {
            currentOptions.splice(currentOptionsPointer, 1)
            currentOptionsPointer = -1
          }
        } else {
          this.nextQuestion()
        }
      } else {
        answers[currentQuestionId] = line
        this.nextQuestion()
      }
    }
  }

  nextQuestion () {
    currentQuestion = questions.shift()

    while (currentQuestion && currentQuestion.condition && !currentQuestion.condition(answers)) {
      currentQuestion = questions.shift()
    }

    logQueue.printLogQueue()

    if (currentQuestion) {
      currentQuestionId = null

      this.rli.write('\n' + this.colors.question(currentQuestion.question) + '\n')
      this.rli.write(currentQuestion.hint + '\n')
      this.showPrompt()

      currentOptions = currentQuestion.options || null
      currentQuestionId = currentQuestion.id
      this.suggestOption(0)
    } else {
      this.kill()
      done(answers)
    }
  }

  process (_questions, _done) {
    questions = _questions
    answers = {}
    done = _done

    this.nextQuestion()
  }
}

module.exports = StateMachine
