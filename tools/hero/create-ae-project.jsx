/* Run from After Effects: File > Scripts > Run Script File. */
(function buildBusemNaCzasHero() {
  app.beginUndoGroup('Build BusemNaCzas Premium Hero')
  var project = app.project || app.newProject()
  var scriptFile = new File($.fileName)
  var root = scriptFile.parent.parent.parent
  var layersDir = new Folder(root.fsName + '/work/hero/layers')
  var outputDir = new Folder(root.fsName + '/output/hero-production')
  var plates = project.items.addFolder('01_PLATES')
  var mattes = project.items.addFolder('02_MATTES')
  var precomps = project.items.addFolder('03_PRECOMPS')
  var output = project.items.addFolder('04_OUTPUT')
  var master = project.items.addComp('BusemNaCzas_Hero_Master', 2560, 1440, 1, 4, 30)
  master.parentFolder = output
  master.motionBlur = true
  master.shutterAngle = 120
  master.shutterPhase = -60

  function importLayer(name, folder) {
    var file = new File(layersDir.fsName + '/' + name + '.png')
    if (!file.exists) throw new Error('Missing layer: ' + file.fsName)
    var item = project.importFile(new ImportOptions(file))
    item.parentFolder = folder
    return item
  }
  function add(item, name) {
    var layer = master.layers.add(item)
    layer.name = name
    layer.startTime = 0
    layer.outPoint = 4
    return layer
  }

  var background = add(importLayer('background', plates), 'BasePlate_SOURCE_FAITHFUL')
  var sky = add(importLayer('sky', plates), 'Sky_STATIC')
  var clouds = add(importLayer('clouds', plates), 'Clouds_WRAPPED')
  var mountains = add(importLayer('mountains', plates), 'Mountains_WRAPPED')
  var trees = add(importLayer('trees', plates), 'Trees_WRAPPED')
  var guardrails = add(importLayer('guardrails', plates), 'Guardrails_WRAPPED')
  var road = add(importLayer('road', plates), 'Road_WRAPPED')
  var lanes = add(importLayer('lanes', plates), 'Lanes_WRAPPED')
  var holdout = add(importLayer('static-holdout', mattes), 'Foreground_HOLDOUT_STATIC')
  holdout.enabled = false
  var van = add(importLayer('van', plates), 'Van_CAMERA_MOUNTED')
  var rearWheel = add(importLayer('wheel-rear', plates), 'Wheel_REAR')
  var frontWheel = add(importLayer('wheel-front', plates), 'Wheel_FRONT')
  var logo = add(importLayer('logo', plates), 'Logo_FIXED')

  function cyclePosition(layer, pixels) {
    var position = layer.property('Transform').property('Position')
    var start = position.value
    position.setValueAtTime(0, start)
    position.setValueAtTime(4, [start[0] - pixels, start[1]])
    position.expression = 'loopOut("cycle")'
  }
  function cycleRotation(layer, hub) {
    var transform = layer.property('Transform')
    transform.property('Anchor Point').setValue(hub)
    var rotation = transform.property('Rotation')
    rotation.setValueAtTime(0, 0)
    rotation.setValueAtTime(4, 1440)
    rotation.expression = 'loopOut("cycle")'
  }
  cyclePosition(road, 58)
  cyclePosition(lanes, 70)
  cycleRotation(frontWheel, [1168, 597])
  cycleRotation(rearWheel, [1472, 574])

  app.endUndoGroup()
  alert('Hero project created. Save this project as an .aep file.')
}())
