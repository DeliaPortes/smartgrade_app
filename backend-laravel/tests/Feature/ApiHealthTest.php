<?php

namespace Tests\Feature;

use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class ApiHealthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['cors.allowed_origins' => ['https://tracked.example']]);
    }

    public function test_api_root_returns_the_track_ed_status(): void
    {
        $this->getJson('/api/')
            ->assertOk()
            ->assertExactJson(['message' => 'TrackEd API is running.']);
    }

    public function test_health_endpoint_confirms_database_connectivity(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertExactJson([
                'status' => 'ok',
                'database' => 'connected',
            ]);
    }

    public function test_health_failure_logs_ssl_diagnostics_without_exposing_the_ca_path(): void
    {
        $caPath = '/etc/secrets/aiven-ca.pem';
        config(['database.connections.mysql.options' => [\PDO::MYSQL_ATTR_SSL_CA => $caPath]]);

        DB::shouldReceive('select')
            ->once()
            ->with('SELECT 1')
            ->andThrow(new QueryException('mysql', 'SELECT 1', [], new \PDOException('Connection failed')));

        Log::shouldReceive('error')
            ->once()
            ->with('TrackEd database readiness check failed.', \Mockery::on(
                fn (array $context): bool => $context['ssl_ca_path_configured'] === true
                    && $context['ssl_ca_file_readable'] === is_readable($caPath)
                    && $context['pdo_mysql_loaded'] === extension_loaded('pdo_mysql')
                    && $context['openssl_loaded'] === extension_loaded('openssl')
                    && ! in_array($caPath, $context, true),
            ));

        $this->getJson('/api/health')
            ->assertServiceUnavailable()
            ->assertExactJson([
                'status' => 'degraded',
                'database' => 'unavailable',
            ]);
    }

    public function test_root_health_endpoint_is_available_for_deploy_checks(): void
    {
        $this->getJson('/health')
            ->assertOk()
            ->assertExactJson([
                'status' => 'ok',
                'database' => 'connected',
            ]);
    }

    public function test_cors_preflight_allows_configured_origins_and_headers(): void
    {
        $this->call('OPTIONS', '/api/me', server: [
            'HTTP_ORIGIN' => 'https://tracked.example',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
            'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'authorization,content-type',
        ])
            ->assertNoContent()
            ->assertHeader('access-control-allow-origin', 'https://tracked.example');
    }

    public function test_cors_does_not_allow_unconfigured_origins(): void
    {
        $this->call('OPTIONS', '/api/me', server: [
            'HTTP_ORIGIN' => 'https://unexpected.example',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
        ])
            ->assertNoContent()
            ->assertHeaderMissing('access-control-allow-origin');
    }
}
