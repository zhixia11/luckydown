import { createVNode, render, reactive, defineComponent } from 'vue'
import { Dropdown } from 'antdv-next'
import './style.css'

export function createPopupRenderer() {
  return () => {
    let container: HTMLDivElement | null = null

    const state = reactive({
      open: false,
      left: 0,
      top: 0,
      items: [] as any[],
      command: (() => {}) as Function,
    })

    const ProxyComponent = defineComponent({
      name: 'CommandDropdownProxy',
      setup() {
        return () => (
          <div
            class="lucky-command-anchor"
            style={{
              position: 'fixed',
              left: `${state.left}px`,
              top: `${state.top}px`,
              width: '0px',
              height: '0px',
              pointerEvents: 'none',
            }}
          >
            <Dropdown
              classes={{
                root: 'lucky-command-dropdown',
              }}
              open={state.open}
              trigger={['contextmenu']}
              menu={{ items: state.items }}
              onMenuClick={(item: any) => {
                state.command(item)
              }}
            >
              <div style={{ opacity: 0 }}></div>
            </Dropdown>
          </div>
        )
      },
    })

    return {
      onStart: (props: any) => {
        if (!props.clientRect || !props.items) return

        const rect = props.clientRect()
        if (rect) {
          state.left = rect.left
          state.top = rect.bottom
        }
        state.items = props.items
        state.command = props.command

        container = document.createElement('div')
        document.body.appendChild(container)
        render(createVNode(ProxyComponent), container)

        state.open = true
      },

      onUpdate(props: any) {
        if (!props.clientRect || !container) return

        const rect = props.clientRect()
        if (rect) {
          state.left = rect.left
          state.top = rect.bottom
        }
        state.items = props.items
        state.open = true
      },

      onExit() {
        state.open = false
        if (container) {
          render(null, container)
          container.remove()
          container = null
        }
      },
    }
  }
}
