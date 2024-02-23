import { init } from 'z3-solver';

async function main() {
    await simpleFields();
    console.log();

    await memberAccess();
    console.log();

    await strings();
    console.log();

    await arrays();
    console.log();

    await nullValue();
    console.log();
}

async function simpleFields() {
    console.log('Checking: author == auth && title == "Title" && rating > 1');

    const { Z3, em } = await init();
    const config = Z3.mk_config();
    const ctx = Z3.mk_context(config);
    Z3.del_config(config);

    const authSort = Z3.mk_uninterpreted_sort(
        ctx,
        Z3.mk_string_symbol(ctx, 'Auth')
    );
    const strSort = Z3.mk_string_sort(ctx);
    const intSort = Z3.mk_int_sort(ctx);

    const auth = Z3.mk_const(ctx, Z3.mk_string_symbol(ctx, 'auth'), authSort);
    const author = Z3.mk_const(
        ctx,
        Z3.mk_string_symbol(ctx, 'author'),
        authSort
    );
    const title = Z3.mk_const(ctx, Z3.mk_string_symbol(ctx, 'title'), strSort);
    const rating = Z3.mk_const(
        ctx,
        Z3.mk_string_symbol(ctx, 'rating'),
        intSort
    );

    const solver = Z3.mk_solver(ctx);

    Z3.solver_assert(
        ctx,
        solver,
        Z3.mk_and(ctx, [
            // author == auth
            Z3.mk_eq(ctx, author, auth),
            // title == 'Title'
            Z3.mk_eq(ctx, title, Z3.mk_string(ctx, 'Title')),
            // rating > 1
            Z3.mk_gt(ctx, rating, Z3.mk_int(ctx, 1, intSort)),
        ])
    );
    console.log('Sat:', await Z3.solver_check(ctx, solver));
    console.log(
        'Model:',
        Z3.model_to_string(ctx, Z3.solver_get_model(ctx, solver))
    );

    em.PThread.terminateAllThreads();
}

async function memberAccess() {
    console.log('Checking: authorId == auth().id || author.role == "Admin"');

    const { Z3, em } = await init();
    const config = Z3.mk_config();
    const ctx = Z3.mk_context(config);
    Z3.del_config(config);

    const strSort = Z3.mk_string_sort(ctx);
    const intSort = Z3.mk_int_sort(ctx);

    const authId = Z3.mk_const(
        ctx,
        Z3.mk_string_symbol(ctx, 'authId'),
        intSort
    );
    const authorId = Z3.mk_const(
        ctx,
        Z3.mk_string_symbol(ctx, 'authorId'),
        intSort
    );
    const authorRole = Z3.mk_const(
        ctx,
        Z3.mk_string_symbol(ctx, 'author.role'),
        strSort
    );

    const solver = Z3.mk_solver(ctx);

    Z3.solver_assert(
        ctx,
        solver,
        Z3.mk_or(ctx, [
            // authorId == auth().id
            Z3.mk_eq(ctx, authorId, authId),
            // author.role == 'Admin'
            Z3.mk_eq(ctx, authorRole, Z3.mk_string(ctx, 'Admin')),
        ])
    );
    console.log('Sat:', await Z3.solver_check(ctx, solver));
    console.log(
        'Model:',
        Z3.model_to_string(ctx, Z3.solver_get_model(ctx, solver))
    );

    em.PThread.terminateAllThreads();
}

async function strings() {
    console.log(
        'Checking: contains(title, "Title") && endsWith(title, "Blog")'
    );

    const { Z3, em } = await init();
    const config = Z3.mk_config();
    const ctx = Z3.mk_context(config);
    Z3.del_config(config);

    const strSort = Z3.mk_string_sort(ctx);
    const title = Z3.mk_const(ctx, Z3.mk_string_symbol(ctx, 'title'), strSort);

    const solver = Z3.mk_solver(ctx);

    Z3.solver_assert(
        ctx,
        solver,
        Z3.mk_and(ctx, [
            Z3.mk_seq_contains(ctx, title, Z3.mk_string(ctx, 'Title')),
            Z3.mk_seq_suffix(ctx, Z3.mk_string(ctx, 'Blog'), title),
        ])
    );
    console.log('Sat:', await Z3.solver_check(ctx, solver));
    console.log(
        'Model:',
        Z3.model_to_string(ctx, Z3.solver_get_model(ctx, solver))
    );

    em.PThread.terminateAllThreads();
}

async function arrays() {
    console.log('Checking: has(tags, "typescript")');

    const { Z3, em } = await init();
    const config = Z3.mk_config();
    const ctx = Z3.mk_context(config);
    Z3.del_config(config);

    const strSort = Z3.mk_string_sort(ctx);
    const strArraySort = Z3.mk_seq_sort(ctx, strSort);

    const tags = Z3.mk_const(
        ctx,
        Z3.mk_string_symbol(ctx, 'tags'),
        strArraySort
    );

    const solver = Z3.mk_solver(ctx);

    Z3.solver_assert(
        ctx,
        solver,
        Z3.mk_seq_contains(ctx, tags, Z3.mk_string(ctx, 'typescript'))
    );
    console.log('Sat:', await Z3.solver_check(ctx, solver));
    // not sure why we don't get a model here
    console.log(
        'Model:',
        Z3.model_to_string(ctx, Z3.solver_get_model(ctx, solver))
    );

    em.PThread.terminateAllThreads();
}
