DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN 
        SELECT table_name, column_name, column_default
        FROM information_schema.columns 
        WHERE (column_default LIKE 'nextval%' OR is_identity = 'YES') 
          AND table_schema = 'public'
    LOOP
        EXECUTE format(
            'SELECT setval(pg_get_serial_sequence(%L, %L), COALESCE(MAX(%I), 1)) FROM %I',
            r.table_name, r.column_name, r.column_name, r.table_name
        );
    END LOOP;
END $$;
