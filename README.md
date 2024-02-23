# Experimentation with using `z3` for constraint checking

## Using low-level Z3 API

The high-level API has limited functionality and doesn't support String theory.

## Modeling constraints

### Simple fields

Simple fields can be modeled as Z3 const with corresponding sort (`sort` is the "type" concept in Z3). References to the same field should use the same const instance (so that they're guaranteed to be bound to the same value).

```prisma
@@allow('all', rating > 0)
```

```ts
const rating = Z3.mk_const(ctx, Z3.mk_string_symbol(ctx, 'rating'), intSort);
Z3.solver_assert(
    ctx,
    solver,
    Z3.mk_gt(ctx, rating, Z3.mk_int(ctx, 0, intSort))
);
```

### Member accesses

Member accesses can be modeled as const with a corresponding sort. Same member accesses should share the same const instance.

```prisma
@@allow('all', author.role == 'ADMIN')
```

```ts
const authorRole = Z3.mk_const(
    ctx,
    Z3.mk_string_symbol(ctx, 'role'),
    stringSort
);
Z3.solver_assert(
    ctx,
    solver,
    Z3.mk_eq(ctx, authorRole, Z3.mk_string(ctx, 'Admin'))
);
```

### `auth()`

`auth()` can be modeled as a const of `Auth` sort. The `Auth` sort represents the model `User` or the model marked with `@@auth`.

```prisma
@@allow('all', auth() == author)
```

```ts
const authSort = Z3.mk_uninterpreted_sort(
    ctx,
    Z3.mk_string_symbol(ctx, 'Auth')
);
const auth = Z3.mk_const(ctx, Z3.mk_string_symbol(ctx, 'auth'), authSort);
const author = Z3.mk_const(ctx, Z3.mk_string_symbol(ctx, 'author'), authSort);
Z3.solver_assert(ctx, solver, Z3.mk_eq(ctx, auth, author));
```

### Simple arrays

Simple arrays can be modeled as const of Sequence sort.

```prisma
@@allow('all', has(tags, 'typescript'))
```

```ts
const strSort = Z3.mk_string_sort(ctx);
const strArraySort = Z3.mk_seq_sort(ctx, strSort);
const tags = Z3.mk_const(ctx, Z3.mk_string_symbol(ctx, 'tags'), strArraySort);
Z3.solver_assert(
    ctx,
    solver,
    Z3.mk_seq_contains(ctx, tags, Z3.mk_string(ctx, 'typescript'))
);
```

### Collection predicate expressions

I think we can ignore collection predicate expressions for now. Technically "ignore" can be implemented by creating a new boolean const for each instance (so it can be bound to arbitrary boolean value).

```prisma
@@allow('all', comments?[published == true])
```

```ts
const pre = Z3.mk_const(ctx, Z3.mk_string_symbol(ctx, 'pre'), boolSort);
Z3.solver_assert(ctx, solver, pre);
```

### `null`

How should we deal with `null`?

```prisma
@@allow('all', author != null && title != null)
```
