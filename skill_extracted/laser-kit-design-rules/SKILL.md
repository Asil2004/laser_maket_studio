---
name: "laser-kit-design-rules"
description: "Use when designing or generating laser-cut plywood model kits (LaserMaket Studio generators, towers, trusses, vehicles, mechanisms, boxes, lamps, spheres, buildings, industrial plants) to apply proven joinery and layout rules."
---

# Laser kit design rules (learned from ~40 commercial kits + industrial model photos)

Sources: pumpjack, derrick, comm tower, LEP pylon, observation tower, Golden Gate, locomotives, train set, tank, guitar, machine tool, greenhouse, looms, BelAZ (+instructions), Kenworth, Hilux, tank car, fire truck, caravan, lunar rover, microscope, hot-air balloons, pendant lamps, balancing bird, K40 test card, mosques, combination-lock safes, gear-hinge glasses case, articulated desk lamp, fretwork vase, tree-of-life candle holder; chemical-plant photos.

## Material, kerf and fit
- Plywood 3 mm default; 4 mm large; HDF 2.5 fine; some kits mix 1/4" and 1/2" stock - state thickness per part.
- Slot width = t + clearance parameter (3 mm: 2.7-3.2; 4 mm: 3.4-4.2). Never hardcode.
- Always offer a test card: slot comb with 5 widths (clearance -0.2..+0.2, engraved values) + 10x10 square hole and plug for kerf. Implemented in LaserMaket cooling tower as S1-S3.
- Tab lengths 4-20 mm; standard t x 10; pin holes t x t.

## Joinery
1. Box finger joints along whole edges (safe, box kits: fingers ~5-8 mm, alternating, corner notches).
2. Tab-through-slot into floors; slots >= 2t from edges.
3. Cross-lap (half-height slots from opposite sides).
4. T-key / bayonet; locking keys through protruding tabs.
5. Snap tabs with bulbs/keyhole ends; spring 'C' clips cut from ply.
6. Jigsaw joints for long rings/strips.
7. Axles: '+' hole fixed, round free; washers, spacers, retaining clips.
8. Laminations for thick parts; tyre treads as toothed discs.
9. Hinges: pin through ear plates; gear-sector hinge (meshing teeth on lid and body); friction joints with tri-lobe knobs and stacked spacers (articulated lamp).
10. X-shaped cross plates with slots holding vertical panels (vase, lantern).

## Curved surfaces
- Living hinge: parallel staggered cuts, only in the bend zone (glasses case) or whole panel. Cuts parallel to the bend axis; pitch ~0.8t+0.8 mm (1.5-3), cut 14 mm, bridge 3 mm, keep 1.6 mm from edges/holes and keep the label zone uncut.
- Slice-form domes/spheres/lamps: identical radial ribs (crescents) into rings/discs with radial slots (balloon, mosque domes, pendant lamps).
- Polygonal barrel: bulkheads + staves.

## Mechanisms
- Combination lock: number wheels engraved around the rim, each with a gate notch, on a common axle with spacers; fence bar drops when all gates align.
- Gears with '+' hubs and lightening holes; cranks; ratchets; counterweights.

## Decoration
- Architecture panels: crenellated tops, arches, jali grilles of small square holes, star rosettes; layered panels for depth.
- Silhouette scenes on layered discs (candle holder: back disc + scene layer + tea-light hole).
- Fretwork vines on vertical panels: keep bridges >= 1.5t.

## Numbering and labels
- Matching engraved number on BOTH halves of every joint (ring slot '3' <-> rib T03; rib slot 'H2' <-> ring H2). Implemented in LaserMaket cooling tower (part.marks, engraved via je/Ne).
- Part number + quantity, L/R mirror labels, lettered sheets, engraving red/blue vs cut, dashed glue marks, dimension notes on the drawing.

## Lattice / trusses
- One flat panel with triangular windows; bars >= 1.5t; inner corners r 1.5-3 mm.

## Industrial plant models
- Pipe racks, columns with ring platforms + ladders, saddle vessels, tank farms, steel frames with stairs/rails, pumps on plinths, nameplates. Colours: silver, yellow rails, black steel, green/orange pipes, blue roofs.

## Sheet layout and checks
- Frame border, 2-3 mm gaps, grouped subassemblies with titles, step-by-step exploded instructions.
- Checklist: slots = t + clearance; tabs match; web >= t; rounded lattice corners; hinges tested; long parts split; joint numbers engraved; test card included.