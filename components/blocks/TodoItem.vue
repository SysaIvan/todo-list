<template>
  <v-dialog
    v-model="newTodoDialog"
    transition="dialog-bottom-transition"
    hide-overlay
    fullscreen
    @input="$emit('dialogState', $event)"
  >
    <template #activator="{on, attrs}">
      <slot name="activator" :attrs="attrs" :on="on" />
    </template>

    <v-card>
      <v-toolbar
        dark
        color="primary"
      >
        <v-btn
          icon
          dark
          @click="newTodoDialog = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>
          {{ settings.title }}
        </v-toolbar-title>
        <v-spacer />
        <v-toolbar-items >
          <v-btn
            v-if="!settings.readonly"
            :disabled="!validForm"
            dark
            text
            @click="saveTodo"
          >
            {{ settings.btnSaveText }}
          </v-btn>

          <v-btn
            v-else
            dark
            text
            @click="localType = 'edit'"
          >
            Edit
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-container>
        <v-row justify="center" align="center">
          <v-col cols="12" sm="8" md="6">
            <v-form
              ref="form"
              v-model="validForm"
              lazy-validation
            >
              <v-text-field
                v-model="values.title"
                :rules="[v => !!v || 'Title is required']"
                :readonly="settings.readonly"
                label="Title"
                required
              />

              <v-row>
                <v-col cols="6">
                  <v-menu
                    ref="menuDate"
                    v-model="menuDate"
                    :close-on-content-click="false"
                    :return-value.sync="values.date"
                    :disabled="settings.readonly"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="values.date"
                        label="Start date"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                      />
                    </template>
                    <v-date-picker
                      v-model="values.date"
                      :min="dateNowISO[0]"
                      no-title
                      scrollable
                      light
                    >
                      <v-spacer />
                      <v-btn
                        text
                        color="primary"
                        @click="menuDate = false"
                      >
                        Cancel
                      </v-btn>
                      <v-btn
                        text
                        color="primary"
                        @click="$refs.menuDate.save(values.date)"
                      >
                        OK
                      </v-btn>
                    </v-date-picker>
                  </v-menu>
                </v-col>

                <v-col cols="6">
                  <v-menu
                    ref="menuTime"
                    v-model="menuTime"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    :return-value.sync="values.time"
                    :disabled="settings.readonly"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="values.time"
                        label="Start time"
                        prepend-icon="mdi-clock-time-four-outline"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                      />
                    </template>
                    <v-time-picker
                      v-if="menuTime"
                      v-model="values.time"
                      :min="timeNowIso"
                      format="24hr"
                      light
                      full-width
                      @click:minute="$refs.menuTime.save(values.time)"
                    ></v-time-picker>
                  </v-menu>
                </v-col>
              </v-row>

              <v-textarea v-model="values.text" :readonly="settings.readonly" label="Description" name="Text" />
            </v-form>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { Todo, TodoDto } from '~/interfaces/Todo';
import TodosStore from '~/store/TodosStore';

@Component
export default class TodoItem extends Vue {
  @Prop({ default: 'new', type: String }) type!: string // new | item | edit
  @Prop({ default: () => ({}), type: Object }) dataSet!: Todo

  localType = this.type

  menuDate = false
  menuTime = false

  dateNow = new Date(Date.now() + 1000 * 60 * 5)
  dateNowISO = `${this.dateNow.getFullYear()}-${this.dateNow.getMonth() + 1}-${this.dateNow.getDate()}`
  timeNowIso = `${this.dateNow.getHours()}:${this.dateNow.getMinutes() < 10 ? '0' + this.dateNow.getMinutes() : this.dateNow.getMinutes()}`

  values: TodoDto = Object.assign({}, { title: '', text: '', date: this.dateNowISO, time: this.timeNowIso }, this.dataSet)
  validForm = false
  newTodoDialog = false

  get settings () {
    const defaultSettings = { title: 'New todo', readonly: false, btnSaveText: 'Save' }

    switch (this.localType) {
      case 'new':
        return defaultSettings
      case 'item':
        return { title: this.dataSet.title, readonly: true }
      case 'edit':
        return { title: this.dataSet.title, readonly: false, btnSaveText: 'Update' }
      default:
        return defaultSettings
    }
  }

  @Watch('newTodoDialog')
  dialogClosed(val: boolean) {
    if (!val) {
      setTimeout(() => this.$emit('dialogClosed', val), 300)
    }
  }

  destroyed () {
    this.values = { title: '', text: '', date: this.dateNowISO, time: this.timeNowIso }
  }

  saveTodo () {
    // @ts-ignore
    if (this.$refs.form.validate()) {
      if (this.localType === 'new') {
        TodosStore.addTodo(this.values)
      } else {
        TodosStore.updateTodo(this.values as Todo)
      }
      this.values = { title: '', text: '', date: this.dateNowISO, time: this.timeNowIso }
      // @ts-ignore
      this.$refs.form.resetValidation()
      this.newTodoDialog = false
    }
  }
}
</script>
