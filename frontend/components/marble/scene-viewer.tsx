'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { cn } from '@/lib/utils'

export type TransformMode = 'translate' | 'rotate' | 'scale'

export interface SceneViewerHandle {
  addModel: (glbUrl: string, name: string, defaultScale?: number) => void
  removeSelected: () => void
  setTransformMode: (mode: TransformMode) => void
}

interface SceneViewerProps {
  plyUrl: string
  /**
   * 360° world mode (WorldGen output): the splats surround the origin, so the
   * camera starts inside the scene and orbiting means "looking around".
   * Default (false) suits SHARP output: a forward-facing scene viewed from
   * a pulled-back camera.
   */
  worldMode?: boolean
  className?: string
  onReady?: () => void
  onSelectModel?: (id: string | null) => void
  onTransformModeChange?: (mode: TransformMode) => void
}

interface PlacedMesh {
  id: string
  name: string
  object: import('three').Object3D
}

const SceneViewer = forwardRef<SceneViewerHandle, SceneViewerProps>(
  function SceneViewer(
    { plyUrl, worldMode = false, className, onReady, onSelectModel, onTransformModeChange },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null)
    const internalsRef = useRef<{
      scene: import('three').Scene
      camera: import('three').PerspectiveCamera
      renderer: import('three').WebGLRenderer
      splatViewer: any
      orbitControls: import('three/examples/jsm/controls/OrbitControls.js').OrbitControls
      transformControls: import('three/examples/jsm/controls/TransformControls.js').TransformControls
      placedMeshes: PlacedMesh[]
      selectedId: string | null
      animFrameId: number
    } | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Select a placed mesh and attach transform controls
    const selectMesh = useCallback(
      (hitId: string | null) => {
        const internals = internalsRef.current
        if (!internals) return

        internals.selectedId = hitId
        onSelectModel?.(hitId)

        // Detach transform controls first
        internals.transformControls.detach()

        // Highlight selected + attach gizmo
        for (const placed of internals.placedMeshes) {
          const isSelected = placed.id === hitId
          placed.object.traverse((child) => {
            if ((child as import('three').Mesh).isMesh) {
              const mesh = child as import('three').Mesh
              const mat = mesh.material as import('three').MeshStandardMaterial
              if (mat.emissive) {
                mat.emissive.setHex(isSelected ? 0x333366 : 0x000000)
              }
            }
          })
          if (isSelected) {
            internals.transformControls.attach(placed.object)
          }
        }
      },
      [onSelectModel],
    )

    // Initialize Three.js scene
    useEffect(() => {
      const container = containerRef.current
      if (!container) return

      let cancelled = false

      async function init() {
        const THREE = await import('three')
        const { OrbitControls } = await import(
          'three/examples/jsm/controls/OrbitControls.js'
        )
        const { TransformControls } = await import(
          'three/examples/jsm/controls/TransformControls.js'
        )
        const GaussianSplats3D = await import(
          '@mkkellogg/gaussian-splats-3d'
        )

        if (cancelled) return

        const width = container.clientWidth
        const height = container.clientHeight

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(width, height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.0
        container.appendChild(renderer.domElement)

        // Scene
        const scene = new THREE.Scene()

        // Camera
        const camera = new THREE.PerspectiveCamera(
          65,
          width / height,
          worldMode ? 0.01 : 0.1,
          500,
        )
        if (worldMode) {
          // Inside the 360° world: tiny orbit radius = head rotation.
          camera.position.set(0, 0, 0.2)
        } else {
          camera.position.set(0, 1.5, 4)
        }

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
        scene.add(ambientLight)
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
        dirLight.position.set(5, 10, 5)
        scene.add(dirLight)

        // Orbit Controls
        const orbitControls = new OrbitControls(camera, renderer.domElement)
        orbitControls.enableDamping = true
        orbitControls.dampingFactor = 0.1
        orbitControls.target.set(0, 0, 0)
        if (worldMode) {
          // Keep the camera inside the splat shell; dragging looks around
          // instead of orbiting a distant object.
          orbitControls.minDistance = 0.05
          orbitControls.maxDistance = 3
          orbitControls.rotateSpeed = -0.4
          orbitControls.zoomSpeed = 0.5
        }

        // Transform Controls (gizmo for move/rotate/scale)
        const transformControls = new TransformControls(
          camera,
          renderer.domElement,
        )
        transformControls.setMode('translate')
        transformControls.setSize(0.8)
        scene.add(transformControls.getHelper())

        // Disable orbit when dragging the gizmo
        transformControls.addEventListener('dragging-changed', (event) => {
          orbitControls.enabled = !event.value
        })

        // Gaussian Splat Viewer
        let splatViewer: any = null
        try {
          splatViewer = new GaussianSplats3D.Viewer({
            selfDrivenMode: false,
            renderer: renderer,
            camera: camera,
            useBuiltInControls: false,
            threeScene: scene,
            sharedMemoryForWorkers: false,
          })

          await splatViewer.addSplatScene(plyUrl, {
            splatAlphaRemovalThreshold: 5,
            showLoadingUI: false,
            rotation: [1, 0, 0, 0],
          })
        } catch (e) {
          console.error('Failed to load Gaussian Splat:', e)
          if (!cancelled)
            setError(
              `Failed to load 3D scene: ${e instanceof Error ? e.message : e}`,
            )
        }

        if (cancelled) {
          renderer.dispose()
          return
        }

        const internals = {
          scene,
          camera,
          renderer,
          splatViewer,
          orbitControls,
          transformControls,
          placedMeshes: [] as PlacedMesh[],
          selectedId: null as string | null,
          animFrameId: 0,
        }
        internalsRef.current = internals

        // WASD fly navigation (world mode): move camera and orbit target
        // together so dragging still means "look around" from the new spot.
        const moveKeys = { w: false, a: false, s: false, d: false, q: false, e: false, shift: false }
        const _fwd = new THREE.Vector3()
        const _right = new THREE.Vector3()
        const _up = new THREE.Vector3(0, 1, 0)

        function applyMovement() {
          if (!worldMode) return
          const speed = moveKeys.shift ? 0.25 : 0.08
          camera.getWorldDirection(_fwd)
          _right.crossVectors(_fwd, _up).normalize()
          const delta = new THREE.Vector3()
          if (moveKeys.w) delta.addScaledVector(_fwd, speed)
          if (moveKeys.s) delta.addScaledVector(_fwd, -speed)
          if (moveKeys.d) delta.addScaledVector(_right, speed)
          if (moveKeys.a) delta.addScaledVector(_right, -speed)
          if (moveKeys.e) delta.addScaledVector(_up, speed)
          if (moveKeys.q) delta.addScaledVector(_up, -speed)
          if (delta.lengthSq() > 0) {
            camera.position.add(delta)
            orbitControls.target.add(delta)
          }
        }

        // Render loop
        function animate() {
          internals.animFrameId = requestAnimationFrame(animate)
          applyMovement()
          orbitControls.update()
          if (internals.splatViewer) {
            internals.splatViewer.update()
            internals.splatViewer.render()
          } else {
            renderer.render(scene, camera)
          }
        }
        animate()

        // Resize handling
        const resizeObserver = new ResizeObserver(() => {
          const w = container.clientWidth
          const h = container.clientHeight
          camera.aspect = w / h
          camera.updateProjectionMatrix()
          renderer.setSize(w, h)
        })
        resizeObserver.observe(container)

        // Click to select
        const raycaster = new THREE.Raycaster()
        const pointer = new THREE.Vector2()

        function onPointerDown(event: PointerEvent) {
          // Ignore if dragging the gizmo
          if (transformControls.dragging) return

          const rect = renderer.domElement.getBoundingClientRect()
          pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
          pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
          raycaster.setFromCamera(pointer, camera)

          const meshObjects = internals.placedMeshes.map((m) => m.object)
          const intersects = raycaster.intersectObjects(meshObjects, true)

          let hitId: string | null = null
          if (intersects.length > 0) {
            for (const placed of internals.placedMeshes) {
              let obj: import('three').Object3D | null =
                intersects[0].object
              while (obj) {
                if (obj === placed.object) {
                  hitId = placed.id
                  break
                }
                obj = obj.parent
              }
              if (hitId) break
            }
          }

          selectMesh(hitId)
        }
        renderer.domElement.addEventListener('pointerdown', onPointerDown)

        // Keyboard shortcuts: W=translate, E=rotate, R=scale, Esc=deselect, Delete=remove
        // In world mode with nothing selected, WASD+QE fly the camera instead.
        function onKeyDown(event: KeyboardEvent) {
          // Don't capture keys if user is typing in an input
          if (
            event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLTextAreaElement
          )
            return

          const key = event.key.toLowerCase()
          if (worldMode && !internals.selectedId) {
            if (key in moveKeys) {
              moveKeys[key as keyof typeof moveKeys] = true
              return
            }
            if (key === 'shift') {
              moveKeys.shift = true
              return
            }
          }

          switch (event.key.toLowerCase()) {
            case 'w':
              transformControls.setMode('translate')
              onTransformModeChange?.('translate')
              break
            case 'e':
              transformControls.setMode('rotate')
              onTransformModeChange?.('rotate')
              break
            case 'r':
              transformControls.setMode('scale')
              onTransformModeChange?.('scale')
              break
            case 'escape':
              selectMesh(null)
              break
            case 'delete':
            case 'backspace':
              if (internals.selectedId) {
                const idx = internals.placedMeshes.findIndex(
                  (m) => m.id === internals.selectedId,
                )
                if (idx !== -1) {
                  const [removed] = internals.placedMeshes.splice(idx, 1)
                  internals.scene.remove(removed.object)
                  transformControls.detach()
                  internals.selectedId = null
                  onSelectModel?.(null)
                }
              }
              break
          }
        }
        function onKeyUp(event: KeyboardEvent) {
          const key = event.key.toLowerCase()
          if (key in moveKeys) moveKeys[key as keyof typeof moveKeys] = false
          if (key === 'shift') moveKeys.shift = false
        }
        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)

        setLoading(false)
        onReady?.()

        // Cleanup
        return () => {
          window.removeEventListener('keydown', onKeyDown)
          window.removeEventListener('keyup', onKeyUp)
          resizeObserver.disconnect()
          renderer.domElement.removeEventListener('pointerdown', onPointerDown)
          cancelAnimationFrame(internals.animFrameId)
          transformControls.dispose()
          if (internals.splatViewer) {
            try {
              internals.splatViewer.dispose()
            } catch {
              /* ignore */
            }
          }
          renderer.dispose()
          if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement)
          }
          internalsRef.current = null
        }
      }

      const cleanupPromise = init()

      return () => {
        cancelled = true
        cleanupPromise.then((cleanup) => cleanup?.())
      }
    }, [plyUrl, worldMode, onReady, onSelectModel, onTransformModeChange, selectMesh])

    // Expose methods to parent
    const addModel = useCallback(
      async (glbUrl: string, name: string, defaultScale = 1.0) => {
        const internals = internalsRef.current
        if (!internals) return

        const THREE = await import('three')
        const { GLTFLoader } = await import(
          'three/examples/jsm/loaders/GLTFLoader.js'
        )

        const loader = new GLTFLoader()
        const gltf = await new Promise<
          import('three/examples/jsm/loaders/GLTFLoader.js').GLTF
        >((resolve, reject) => {
          loader.load(glbUrl, resolve, undefined, reject)
        })

        const model = gltf.scene
        model.scale.setScalar(defaultScale)

        // Place in front of camera
        const dir = new THREE.Vector3()
        internals.camera.getWorldDirection(dir)
        const pos = internals.camera.position
          .clone()
          .add(dir.multiplyScalar(3))
        model.position.copy(pos)
        model.position.y = 0

        internals.scene.add(model)

        const id = `model-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        internals.placedMeshes.push({ id, name, object: model })

        // Auto-select and attach gizmo
        selectMesh(id)
      },
      [selectMesh],
    )

    const removeSelected = useCallback(() => {
      const internals = internalsRef.current
      if (!internals || !internals.selectedId) return

      const idx = internals.placedMeshes.findIndex(
        (m) => m.id === internals.selectedId,
      )
      if (idx === -1) return

      const [removed] = internals.placedMeshes.splice(idx, 1)
      internals.scene.remove(removed.object)
      internals.transformControls.detach()
      internals.selectedId = null
      onSelectModel?.(null)
    }, [onSelectModel])

    const setTransformMode = useCallback((mode: TransformMode) => {
      const internals = internalsRef.current
      if (!internals) return
      internals.transformControls.setMode(mode)
    }, [])

    useImperativeHandle(
      ref,
      () => ({ addModel, removeSelected, setTransformMode }),
      [addModel, removeSelected, setTransformMode],
    )

    return (
      <div
        ref={containerRef}
        className={cn('relative h-full w-full', className)}
      >
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30">
            <p className="text-sm text-white/70">Loading 3D scene...</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>
    )
  },
)

export { SceneViewer }
