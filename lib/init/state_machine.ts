import util = require('util')
import {EventEmitter} from 'events'

export class StateMachine extends EventEmitter {
  constructor(private rli, private colors) {
    super()
  }

  private questions
  private currentQuestion
  private answers
  private currentOptions
  private currentOptionsPointer
  private currentQuestionId
  private done

  private showPrompt() {
    this.rli.write(this.colors.ANSWER)
    this.rli.prompt()
  }

  onKeypress(key) {
    if (!this.currentOptions || !key) {
      return
    }

    if (key.name === 'tab' || key.name === 'right' || key.name === 'down') {
      this.suggestNextOption()
    } else if (key.name === 'left' || key.name === 'up') {
      this.currentOptionsPointer = this.currentOptionsPointer + this.currentOptions.length - 2
      this.suggestNextOption()
    }

    if (!key.ctrl && !key.meta && key.name !== 'enter' && key.name !== 'return') {
      key.name = 'escape'
    }
  }

  suggestNextOption() {
    if (!this.currentOptions) {
      return
    }

    this.currentOptionsPointer = (this.currentOptionsPointer + 1) % this.currentOptions.length
    this.rli._deleteLineLeft()
    this.rli._deleteLineRight()
    this.rli.write(this.currentOptions[this.currentOptionsPointer])
  }

  kill() {
    this.currentOptions = null
    this.currentQuestionId = null
    this.rli.write('\n' + this.colors.RESET + '\n')
    this.rli.close()
  }

  onLine(line) {
    if (this.currentQuestionId) {
      this.rli.write(this.colors.RESET)
      line = line.trim().replace(this.colors.ANSWER, '').replace(this.colors.RESET, '')

      if (this.currentOptions) {
        this.currentOptionsPointer = this.currentOptions.indexOf(line)
        if (this.currentOptionsPointer === -1) {
          return
        }
      }

      if (line === '') {
        line = null
      }

      if (this.currentQuestion.boolean) {
        line = (line === 'yes' || line === 'true' || line === 'on')
      }

      if (line !== null && this.currentQuestion.validate) {
        this.currentQuestion.validate(line)
      }

      if (this.currentQuestion.multiple) {
        this.answers[this.currentQuestionId] = this.answers[this.currentQuestionId] || []
        if (line !== null) {
          this.answers[this.currentQuestionId].push(line)
          this.showPrompt()

          if (this.currentOptions) {
            this.currentOptions.splice(this.currentOptionsPointer, 1)
            this.currentOptionsPointer = -1
          }
        } else {
          this.nextQuestion()
        }
      } else {
        this.answers[this.currentQuestionId] = line
        this.nextQuestion()
      }
    }
  }

  nextQuestion() {
    this.currentQuestion = this.questions.shift()

    while (this.currentQuestion && this.currentQuestion.condition && !this.currentQuestion.condition(this.answers)) {
      this.currentQuestion = this.questions.shift()
    }

    this.emit('next_question', this.currentQuestion)

    if (this.currentQuestion) {
      this.currentQuestionId = null

      this.rli.write('\n' + this.colors.question(this.currentQuestion.question) + '\n')
      this.rli.write(this.currentQuestion.hint + '\n')
      this.showPrompt()

      this.currentOptions = this.currentQuestion.options || null
      this.currentOptionsPointer = -1
      this.currentQuestionId = this.currentQuestion.id

      this.suggestNextOption()
    } else {
      this.currentQuestionId = null
      this.currentOptions = null

      // end
      this.kill()
      this.done(this.answers)
    }
  }

  process(_questions, _done) {
    this.questions = _questions
    this.answers = {}
    this.done = _done

    this.nextQuestion()
  }
}