# Fixer Upper

## The Game

**Fixer Upper** is a small house-repair game where the player moves through a run-down house and fixes different problems in each room.

The player walks around the house, finds damaged objects, and interacts with them to start a short repair task. Each repair works a little differently. For example, fixing a wall might require covering a damaged area, while fixing a leaking pipe might require rotating pipe pieces into the correct position.

The goal is to repair all of the damaged parts of the house. The game is meant to feel simple, satisfying, and slightly chaotic, like being given a house with a bunch of small problems and trying to fix everything yourself.

The main part that should make the game fun is that the player is not just clicking a "repair" button. Each damaged object has a small interaction or mini-game connected to it.

---

# Intended Features

## Main House

The game takes place inside a small house with several damaged areas.

The player should be able to walk around the house and approach different repair locations.

There should be at least three repairable problems:

- damaged drywall
- leaking sink or pipe
- damaged floorboard

Each damaged object should visually look different from a repaired object.

---

## Player Movement

The player moves around the house using WASD or the arrow keys.

The player cannot walk through walls.

When the player gets close enough to something that can be repaired, the game should show an interaction message such as:

**Press E to Repair**

Pressing E starts the repair mini-game for that object.

---

## Repair 1: Drywall

A section of a wall has a hole or damaged area.

The player repairs the wall by covering the damaged area.

A simple version could have the player click or drag over the damaged section until enough of the hole has been covered.

When completed:

- the repair mini-game closes
- the wall changes to its repaired appearance
- the repair counts toward the player's total repairs

---

## Repair 2: Leaking Pipe

The player interacts with a leaking sink or pipe.

Several pipe sections appear in the repair screen.

The player rotates the pipe pieces until they form a continuous connection.

When all pieces are connected correctly:

- the leak stops
- the mini-game closes
- the sink/pipe changes to its repaired appearance
- the repair counts toward the player's total

---

## Repair 3: Floorboard

A floorboard in the house is loose or damaged.

The player repairs the floor by selecting or clicking the correct locations to secure the board.

For example, several target areas could appear on the board and the player must click each one to "hammer" it into place.

Once all required spots are completed:

- the floorboard becomes repaired
- the mini-game closes
- the repair counts toward the player's total

---

## Repair Counter

The screen should display how many repairs have been completed.

Example:

**Repairs: 1 / 3**

The number increases whenever a repair is successfully completed.

---

## Winning

The player wins after completing all of the repairs in the house.

After the final repair, the game should show a message such as:

**House Repaired!**

The player should then have the option to restart the game.

---

# Extra Features

These features are part of the full idea but should only be added if there is enough time after the main game works.

### Timer

The game could track how long it takes the player to repair the entire house.

At the end, the player's completion time would be displayed.

### Money / Repair Budget

The player could begin with a certain amount of money.

Different repairs could cost different amounts, requiring the player to decide which repairs to complete first.

### More Repair Types

Possible additional repairs include:

- broken window
- cabinet door
- broken light fixture
- painting a damaged wall

### Sound Effects

Possible sounds include:

- hammer sound for the floor
- water sound for the leaking pipe
- repair completion sound

### Better Graphics

If time allows, damaged and repaired objects could have more detailed visual differences.

---

# Acceptance Criteria

1. The game opens to a playable house or room.

2. The player can move using WASD or the arrow keys.

3. The player cannot move through the outside walls of the house.

4. At least three damaged objects are visible in the house.

5. When the player moves near a damaged object, an interaction message appears.

6. Pressing E while near a damaged object opens that object's repair interaction.

7. The drywall repair has an interactive task the player must complete rather than repairing automatically.

8. Completing the drywall task changes the wall from damaged to repaired.

9. The pipe repair has an interactive task involving connecting or rotating pipe pieces.

10. Completing the pipe repair changes the pipe from leaking/damaged to repaired.

11. The floorboard repair has an interactive task involving securing multiple locations on the board.

12. Completing the floorboard repair changes the board from damaged to repaired.

13. A repair cannot be completed more than once.

14. The game displays the number of completed repairs.

15. The repair counter increases after each successful repair.

16. After all required repairs are completed, the player receives a clear win message.

17. The player can restart the game after winning.

---

# Priorities

## Highest Priority

These are necessary for the game to feel complete:

1. Player movement
2. House layout and wall collision
3. Ability to interact with damaged objects
4. At least two working repair mini-games
5. Repairs visibly change from damaged to repaired
6. Repair counter
7. Win condition

## Medium Priority

These should be completed if time allows:

8. Third repair mini-game
9. Better visual differences between broken and repaired objects
10. Restart button
11. Completion timer

## Lowest Priority

These should be removed first if time is short:

12. Money or repair budget system
13. Additional repair types
14. Sound effects
15. Detailed graphics or animations

If time becomes limited, having a small house with two or three complete and working repairs is more important than having many unfinished repair types.
