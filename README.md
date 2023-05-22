# Seed Splitter

A simple and dependency-free implementation of Shamir's secret sharing.

## Example

With Seed Splitter, you can split a key like this:

```
vault soap student engine hub blanket tortoise fit device critic stage clay
```

into 5 shares like this:

```
s1: topple human laundry luggage will object behave common agree plate spin frog
s2: edit retire pumpkin ritual sorry shove horn lounge orbit coach unhappy return
s3: shrimp cheap snake earn miracle extend hair disagree giraffe news ensure uniform
s4: grunt rookie swing celery crush cup afraid fruit fitness term unable injury
s5: chase isolate surge fluid shock inside drastic throw later arm source bargain
```

you can then use any 3 of those shares to recover the secret.

Any K of N is also supported.

## Quick Start

```sh
docker run --rm -it denoland/deno run \
  https://raw.githubusercontent.com/voltrevo/seed-splitter/main/cli.ts
```

Or if you have deno and have cloned the repo:

```sh
deno run cli.ts
```

## About

Every piece of software that accesses your secret key exposes it to a new attack
vector. Shamir's secret sharing can definitely improve your security, but
trusting another piece of software with your key may not be worth it.

Fortunately, Shamir's secret sharing is not as complicated as it might seem.
Seed Splitter implements the scheme over bip39 mnemonics in under 300 lines¹ of
code and zero dependencies. It's hard to hide vulnerabilities in that footprint.

Additionally, Seed Splitter runs under deno's default settings, which doesn't
provide any IO access.

¹ Not including the CLI. Use `templates/*` if you want the minimum surface area.

## Longer Example

Consider that Alice has this secret key:

```
vault soap student engine hub blanket tortoise fit device critic stage clay
```

Alice needs to be sure she doesn't lose access to this key. Over the years, she
knows her devices will break and get replaced, so she writes the secret key down
and stores it in a safe place.

Time goes by, and this key is used for more and more things. It becomes much
more valuable, and Alice becomes nervous about her key for two reasons:

1. She could lose her single physical backup
2. An attacker can steal the key if they ever find the physical backup

She could solve (1) by making multiple copies and storing them in multiple
locations, but this makes (2) an even bigger problem.

In addition to multiple copies, Alice might consider splitting her key like
this:

```
Locations 1, 2:
  vault soap student engine hub blanket

Locations 3, 4:
  tortoise fit device critic stage clay
```

However, now Alice has 4 points of vulnerability, and even if only one is
stolen, the attacker might gain access to the key by exhaustively checking every
possibility of the missing half.

Alice uses Shamir's secret sharing instead. She splits her key into 5 shares:

```
s1: topple human laundry luggage will object behave common agree plate spin frog
s2: edit retire pumpkin ritual sorry shove horn lounge orbit coach unhappy return
s3: shrimp cheap snake earn miracle extend hair disagree giraffe news ensure uniform
s4: grunt rookie swing celery crush cup afraid fruit fitness term unable injury
s5: chase isolate surge fluid shock inside drastic throw later arm source bargain
```

Any 3 of these shares can be used to recover the secret. Alice tests this by
running the recovery process using `s2`, `s3`, and `s5`:

```
vault soap student engine hub blanket tortoise fit device critic stage clay
```

Once satisfied that the key is recoverable with these new shares, she destroys
her original backup and stores these shares instead, two with friends and the
other three in her own separate locations.

But what if an attacker discovers one or two of these shares? Is the key still
vulnerable to a reduced search space? No.

It turns out that the attacker must still search every possible key. To
demonstrate this, suppose that the attacker has `s2` and `s3`:

```
s2: edit retire pumpkin ritual sorry shove horn lounge orbit coach unhappy return
s3: shrimp cheap snake earn miracle extend hair disagree giraffe news ensure uniform
```

the attacker doesn't know `s5`, but suppose it is this:

```
s5: love evolve art popular old cargo brick asthma acoustic pen dynamic army
```

if you run recovery with these 3 points, you'll recover the secret as:

```
test test test test test test test test test test test junk
```

You can generate this using manual mode by entering the following:

```
Specified points:
    secret: test test test test test test test test test test test junk
    s2:     edit retire pumpkin ritual sorry shove horn lounge orbit coach unhappy return
    s3:     shrimp cheap snake earn miracle extend hair disagree giraffe news ensure uniform

Calculated points:
    s5: love evolve art popular old cargo brick asthma acoustic pen dynamic army
```

And you can replace `secret` with whatever target you like, and it'll calculate
points consistent with `s2` and `s3` which will recover to that target. Since
every key is still possible, the attacker gains zero information with only two
shares.
