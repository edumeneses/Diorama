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

export interface SceneViewerHandle {
  addModel: (glbUrl: string, name: string, defaultScale?: number) => void
  removeSelected: () => void
}

interface SceneViewerProps {
  plyUrl: string
  className?: string
  onReady?: () => void
  onSelectModel?: (id: string | null) => void
}

interface PlacedMesh {
  id: string
  name: string
  object: import('three').Object3D
}

const SceneViewer = forwardRef<SceneViewerHandle, SceneViewerProps>(
  function SceneViewer({ plyUrl, className, onReady, onSelectModel }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const internalsRef = useRef<{
      scene: import('three').Scene
      camera: import('three').PerspectiveCamera
      renderer: import('three').WebGLRenderer
      splatViewer: any
      controls: import('three/examples/jsm/controls/OrbitControls.js').OrbitControls
      placedMeshes: PlacedMesh[]
      selectedId: string | null
      animFrameId: number
    } | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Initialize Three.js scene
    useEffect(() => {
      const container = containerRef.current
      if (!container) return

      let cancelled = false

      async function init() {
        // Dynamic imports to avoid SSR issues
        const THREE = await import('three')
        const { OrbitControls } = await import(
          'three/examples/jsm/controls/OrbitControls.js'
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
        const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 500)
        camera.position.set(0, 1.5, 4)

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
        scene.add(ambientLight)
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
        dirLight.position.set(5, 10, 5)
        scene.add(dirLight)

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.1
        controls.target.set(0, 0, 0)

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
          })
        } catch (e) {
          console.error('Failed to load Gaussian Splat:', e)
          if (!cancelled)
            setError(`Failed to load 3D scene: ${e instanceof Error ? e.message : e}`)
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
          controls,
          placedMeshes: [] as PlacedMesh[],
          selectedId: null as string | null,
          animFrameId: 0,
        }
        internalsRef.current = internals

        // Render loop
        function animate() {
          internals.animFrameId = requestAnimationFrame(animate)
          controls.update()
          if (internals.splatViewer) {
            internals.splatViewer.update()
            internals.splatViewer.render()
          } else {
            renderer.render(scene, camera)
          }
        }
        animate()

        // Handle resize
        const resizeObserver = new ResizeObserver(() => {
          const w = container.clientWidth
          const h = container.clientHeight
          camera.aspect = w / h
          camera.updateProjectionMatrix()
          renderer.setSize(w, h)
        })
        resizeObserver.observe(container)

        // Click to select placed models
        const raycaster = new THREE.Raycaster()
        const pointer = new THREE.Vector2()

        function onPointerDown(event: PointerEvent) {
          const rect = renderer.domElement.getBoundingClientRect()
          pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
          pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
          raycaster.setFromCamera(pointer, camera)

          const meshObjects = internals.placedMeshes.map((m) => m.object)
          const intersects = raycaster.intersectObjects(meshObjects, true)

          let hitId: string | null = null
          if (intersects.length > 0) {
            // Find which placed mesh was hit
            for (const placed of internals.placedMeshes) {
              let obj: THREE.Object3D | null = intersects[0].object
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

          internals.selectedId = hitId
          onSelectModel?.(hitId)

          // Visual feedback: highlight selected
          for (const placed of internals.placedMeshes) {
            placed.object.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh
                const mat = mesh.material as THREE.MeshStandardMaterial
                if (mat.emissive) {
                  mat.emissive.setHex(placed.id === hitId ? 0x333366 : 0x000000)
                }
              }
            })
          }
        }
        renderer.domElement.addEventListener('pointerdown', onPointerDown)

        setLoading(false)
        onReady?.()

        // Cleanup
        return () => {
          resizeObserver.disconnect()
          renderer.domElement.removeEventListener('pointerdown', onPointerDown)
          cancelAnimationFrame(internals.animFrameId)
          if (internals.splatViewer) {
            try { internals.splatViewer.dispose() } catch { /* ignore */ }
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
    }, [plyUrl, onReady, onSelectModel])

    // Expose addModel / removeSelected to parent
    const addModel = useCallback(
      async (glbUrl: string, name: string, defaultScale = 1.0) => {
        const internals = internalsRef.current
        if (!internals) return

        const THREE = await import('three')
        const { GLTFLoader } = await import(
          'three/examples/jsm/loaders/GLTFLoader.js'
        )

        const loader = new GLTFLoader()
        const gltf = await new Promise<import('three/examples/jsm/loaders/GLTFLoader.js').GLTF>(
          (resolve, reject) => {
            loader.load(glbUrl, resolve, undefined, reject)
          },
        )

        const model = gltf.scene
        model.scale.setScalar(defaultScale)

        // Place at camera look-at direction, slightly in front
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

        // Auto-select the newly placed model
        internals.selectedId = id
        onSelectModel?.(id)
      },
      [onSelectModel],
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
      internals.selectedId = null
      onSelectModel?.(null)
    }, [onSelectModel])

    useImperativeHandle(ref, () => ({ addModel, removeSelected }), [
      addModel,
      removeSelected,
    ])

    return (
      <div ref={containerRef} className={cn('relative h-full w-full', className)}>
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
