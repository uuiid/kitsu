<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { MessageSquarePlus } from 'lucide-vue-next'
import { generateUUID } from 'three/src/math/MathUtils.js'
import { AiScriptStore } from '@/store/modules/AiScript.js'
import AiMarkdown from '@/components/cells/AiMarkdown.vue'
import OpenAI from 'openai'
import user from '@/store/modules/user.js'

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: 'sk-eb7dadd82e7b4c6d83c6b1720edaf469',
  dangerouslyAllowBrowser: true
})
const inputRef = ref(null)
const messageRef = ref(null)
const inputMessage = ref(null)
const inputCount = ref(2)
const innerHeight = ref(window.innerHeight)
const messageNmu = computed(() => {
  return AiScript.state.allDialogue.has(AiScript.state.currentDialogue)
    ? AiScript.state.allDialogue.get(AiScript.state.currentDialogue).content
        .length
    : 0
})
const AiScript = AiScriptStore()

const messageList = computed(() => {
  return [...AiScript.state.allDialogue.values()]
})
const messages = computed(() => {
  return AiScript.state.allDialogue.has(AiScript.state.currentDialogue)
    ? AiScript.state.allDialogue.get(AiScript.state.currentDialogue).content
    : []
})
window.addEventListener('resize', e => {
  innerHeight.value = window.innerHeight
})
const inputPosition = computed(() => {
  return messageNmu.value === 0 ? innerHeight.value / 2 - 100 : 10
})

function onInput(event) {
  const text = event.target.value
  const newlineCount = (text.match(/\n/g) || []).length
  if (newlineCount >= 1) {
    inputCount.value = Math.min(newlineCount + 1, 8)
  }
}

async function receiveMessage(content, id) {
  //await openai.chat.completions
  const selfAllContent = []
  selfAllContent.push({
    role: 'system',
    name: id,
    content: '你是名字是小以，是由索以科技开发的剧本创作AI助手'
  })
  for (const item of AiScript.state.allDialogue.get(
    AiScript.state.currentDialogue
  ).content) {
    if (item.type === 'self') {
      selfAllContent.push(item.message)
    }
  }

  const completion = await openai.chat.completions.create({
    messages: selfAllContent,
    model: 'deepseek-chat',
    stream: true
  })
  //AiScript.state.allDialogue.get(id).content.at(-1).message.content = '123'
  //console.log(AiScript.state.allDialogue.get(id).content)
  for await (const part of completion) {
    AiScript.state.allDialogue.get(id).content.at(-1).message.content +=
      part.choices[0].delta.content || ''
    await nextTick(() => {
      messageRef.value.scrollTop = messageRef.value.scrollHeight
    })
  }
  // await AiScript.action.chat(
  //   {
  //     role: 'user',
  //     name: AiScript.state.currentDialogue.id,
  //     model: 'deepseek-r1:1.5b',
  //     messages: selfAllContent,
  //     stream: true
  //   },
  //   async chunk => {
  //     try {
  //       AiScript.state.allDialogue.get(id).content.at(-1).message.content +=
  //         JSON.parse(chunk)
  //           .message.content.replace(`<think>`, '')
  //           .replace(`</think>`, '')
  //       await nextTick(() => {
  //         messageRef.value.scrollTop = messageRef.value.scrollHeight
  //       })
  //     } catch (error) {
  //       console.error('解析错误:', error)
  //     }
  //   }
  // )
  // for await (const part of response) {
  //   AiScript.state.allDialogue.get(id).content.at(-1).content +=
  //     part.message.content.replace(`<think>`, '').replace(`</think>`, '')
  //   await nextTick(() => {
  //     messageRef.value.scrollTop = messageRef.value.scrollHeight
  //   })
  // }
}

function onSend() {
  if (inputMessage.value) {
    const temp = inputMessage.value
    if (!AiScript.state.allDialogue.has(AiScript.state.currentDialogue)) {
      onNewDialogue()
    }
    if (messageNmu.value === 0) {
      AiScript.state.allDialogue.get(AiScript.state.currentDialogue).title =
        temp
    }
    AiScript.state.allDialogue
      .get(AiScript.state.currentDialogue)
      .content.push({
        type: 'self',
        message: {
          role: 'user',
          content: temp
        }
      })
    inputMessage.value = ''
    AiScript.state.allDialogue
      .get(AiScript.state.currentDialogue)
      .content.push({
        type: 'ai',
        message: {
          role: 'system',
          content: ''
        }
      })
    if (
      user.getters.isCurrentUserManager ||
      user.getters.isCurrentUserSupervisor
    ) {
      receiveMessage(temp, AiScript.state.currentDialogue)
    } else {
      AiScript.state.allDialogue.get(
        AiScript.state.currentDialogue
      ).content.message.content = '权限不足'
    }
    // AiScript.state.allDialogue
    //   .get(AiScript.state.currentDialogue)
    //   .content.push({
    //     type: 'ai',
    //     content: response.message.content
    //       .replace(`\u003cthink\u003e`, '')
    //       .replace(`\u003c/think\u003e`, '')
    //   })
  }
  // await nextTick(() => {
  //   messageRef.value.scrollTop = messageRef.value.scrollHeight
  // })
}

onMounted(() => {
  messageRef.value.scrollTop = messageRef.value.scrollHeight
  watch(messageRef.value.scrollHeight, () => {
    messageRef.value.scrollTop = messageRef.value.scrollHeight
  })
})

function handleInputKeyDown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    onSend()
  }
}

async function onNewDialogue() {
  const id = generateUUID()
  AiScript.state.allDialogue.set(id, { id: id, title: '', content: [] })
  AiScript.state.currentDialogue = id
}
</script>

<template>
  <div class="common-layout">
    <el-container class="navbar">
      <div class="navbar">
        <aside :class="{ 'hidden-bar': false }">
          <div class="ai-new-dialogue" @click="onNewDialogue">
            <message-square-plus />
            <span>开启新的创作</span>
          </div>
          <div class="list-view">
            <div
              v-for="item in messageList"
              :key="item.id"
              class="ai-item no-wrap"
              :class="{
                selected: AiScript.state.currentDialogue === item.id
              }"
              @click="AiScript.state.currentDialogue = item.id"
            >
              <span>
                {{ item.title }}
              </span>
            </div>
          </div>
        </aside>
      </div>
      <el-main class="main">
        <div class="main-content-layout">
          <div class="main-content" ref="messageRef">
            <div v-for="item in messages" :key="item" class="">
              <div v-if="item.type === 'ai'" class="ai-message">
                <img class="ai-avatar" src="@/assets/kitsu.png" alt="" />
                <ai-markdown :content="item.message.content"></ai-markdown>
              </div>
              <div v-else class="self-message">
                <ai-markdown :content="item.message.content"></ai-markdown>
                <el-avatar class="self-avatar"> 我</el-avatar>
              </div>
            </div>
          </div>
          <div class="main-input">
            <div
              class="main-input-content"
              :style="`bottom: ${inputPosition}px;`"
            >
              <textarea
                ref="inputRef"
                class="ai-input"
                :rows="inputCount"
                v-model="inputMessage"
                placeholder="给我点创作提示吧"
                @input="onInput"
                @keydown="handleInputKeyDown"
              />
              <div class="input-bottom">
                <div class="send-left">
                  <a></a>
                </div>
                <div class="send-right">
                  <a
                    class="button"
                    :class="{
                      'send-able': inputMessage?.length > 0,
                      'send-unable': !inputMessage?.length > 0
                    }"
                    @click="onSend"
                    >发送</a
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped lang="scss">
.input-bottom {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 8px;
}

.send-right {
}

.common-layout {
  max-height: calc(100vh - 160px);
  height: calc(100vh - 160px);
}

.main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  overflow: hidden;
}

.navbar {
  height: 100%;
  overflow: hidden;
}

aside.hidden-bar {
  left: -250px;
  transition: all 0.3s ease;
}

.dark aside {
  background-color: #2f3136;
  color: $white-grey;

  a {
    color: $white-grey;
  }
}

aside {
  display: flex;
  flex-direction: column;
  height: 100%;

  //position: absolute;
  border-radius: 7px;
  width: 270px;
  gap: 20px;
  align-items: center;
  background-color: rgb(240, 240, 243);
  padding: 15px;
  overflow: hidden;
  //box-shadow: 1px 0 6px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  h2 {
    border: 0;
    text-transform: uppercase;
    font-size: 1em;
    color: $grey;
  }
}

.send-able {
  background-color: #6784e1;
  color: #ececec;
}

.ai-new-dialogue {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  background: #6784e1;
  min-height: 50px;
  color: #ebedf0;
  border-radius: 16px;
  cursor: pointer;
  width: 200px;

  &:hover {
    background: #7291f8;
  }
}

.ai-message {
  display: flex;
  flex-direction: row;
  gap: 10px;
  padding: 0.5cm 50px 0.5cm 0;
}

.no-wrap {
  white-space: nowrap;
}

.self-message {
  display: flex;
  flex-direction: row;
  gap: 10px;
  width: 100%;
  justify-content: right;
  padding: 0.5cm 0 0.5cm 50px;
}

.ai-avatar {
  border-radius: 15px;
  width: 45px;
  height: 45px;
}

.self-avatar {
  min-width: 45px;
  min-height: 45px;
}

.main-content {
  position: absolute;
  max-height: calc(100vh - 160px);
  top: 150px;
  bottom: 150px;
  border-radius: 10px;
  min-height: 140px;
  width: 50%;
  max-width: 50%;
  overflow-x: hidden;
}

.main-content-layout {
  width: 60%;
  height: 100%;
}

.main-input-content {
  position: absolute;
  padding: 20px;
  bottom: 10px;
  background-color: rgb(240, 240, 243);
  border-radius: 30px;
  min-height: 140px;
  width: 50%;
}

.dark .main-input-content {
  background-color: rgb(64, 64, 69);
}

.ai-input {
  width: 100%;
  font-size: 1.5em;
  background-color: rgb(240, 240, 243);
  resize: none;
  overflow: auto;
}

.dark .ai-input {
  background-color: rgb(64, 64, 69);
}

.list-view {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  overflow: auto;
}

.ai-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 15px;
  text-indent: 5px;
  cursor: pointer;
  //justify-content: center;
  min-height: 50px;
  text-align: center;
  border-radius: 10px;
  overflow: hidden;

  &:hover {
    background-color: var(--background-selectable);
  }
}

.selected {
  background-color: var(--background-selectable);
}

.button {
  border: none;
}

.send-unable {
  color: #818181;
}
</style>
